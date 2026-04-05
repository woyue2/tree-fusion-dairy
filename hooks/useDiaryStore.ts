/**
 * [INPUT]:    依赖 lib/db (Dexie) 和 zustand (immer)
 * [OUTPUT]:   导出 useDiaryStore 供日记编辑器和列表消费
 * [POS]:      hooks/useDiaryStore.ts - 日记业务逻辑与本地持久化
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { db } from '@/lib/db'
import { DiaryEntry, DiaryContent } from '@/types'
import { pullDiariesAction } from '@/app/actions/sync'

interface CloudDiaryPayload {
  id?: string
  userId?: string
  user_id?: string
  title?: string
  content?: DiaryContent | string | null
  date?: string
  tags?: unknown
  images?: unknown
  footerImages?: unknown
  footer_images?: unknown
  aiAnalysis?: unknown
  analysis?: unknown
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  deletedAt?: string | null
  deleted_at?: string | null
  _dirty?: number
}

interface DiaryState {
  diaries: Record<string, DiaryEntry>
  isLoading: boolean
  currentDiaryId: string | null
  loadDiaries: () => Promise<void>
  setCurrentDiary: (id: string | null) => void
  upsertDiary: (diary: Partial<DiaryEntry>) => Promise<void>
  deleteDiary: (id: string) => Promise<void>
  addDiary: () => Promise<string>
  saveAnalysis: (id: string, analysis: any) => Promise<void>
  saveStructuredVersion: (id: string, structured: string) => Promise<void>
  pullDiaries: () => Promise<void>
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  try {
    const parsedUrl = new URL(trimmedValue)
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null
    }
    return parsedUrl.toString()
  } catch {
    return null
  }
}

function normalizeImageArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.reduce<string[]>((result, item) => {
    const normalizedUrl = normalizeImageUrl(item)
    if (normalizedUrl && !result.includes(normalizedUrl)) {
      result.push(normalizedUrl)
    }
    return result
  }, [])
}

function normalizeDiaryContent(content?: DiaryContent | string | null): DiaryContent {
  if (!content) {
    return { original: '' }
  }

  if (typeof content === 'string') {
    return { original: content }
  }

  return {
    original: content.original ?? '',
    structured: content.structured ?? undefined,
    final: content.final ?? undefined,
  }
}

function extractLegacyImageLines(text?: string): { text: string; imageUrls: string[]; migrated: boolean } {
  if (!text) {
    return { text: '', imageUrls: [], migrated: false }
  }

  const imageUrls: string[] = []
  let migrated = false

  const contentLines = text.split('\n').filter((line) => {
    const trimmedLine = line.trim()
    if (!trimmedLine.startsWith('img:')) {
      return true
    }

    migrated = true
    const normalizedUrl = normalizeImageUrl(trimmedLine.slice(4).trim())
    if (normalizedUrl && !imageUrls.includes(normalizedUrl)) {
      imageUrls.push(normalizedUrl)
    }

    return false
  })

  return {
    text: contentLines.join('\n').trim(),
    imageUrls,
    migrated,
  }
}

function normalizeDiaryRecord(
  diary: CloudDiaryPayload,
  dirtyOverride?: number
): { entry: DiaryEntry; migratedLegacyImages: boolean } {
  const now = new Date().toISOString()
  const normalizedContent = normalizeDiaryContent(diary.content)
  const originalContent = extractLegacyImageLines(normalizedContent.original)
  const structuredContent = extractLegacyImageLines(normalizedContent.structured)
  const finalContent = extractLegacyImageLines(normalizedContent.final)
  const migratedLegacyImages =
    originalContent.migrated || structuredContent.migrated || finalContent.migrated

  const images = [
    ...normalizeImageArray(diary.images),
    ...originalContent.imageUrls,
    ...structuredContent.imageUrls,
    ...finalContent.imageUrls,
  ].filter((url, index, list) => list.indexOf(url) === index)

  return {
    entry: {
      id: diary.id ?? crypto.randomUUID(),
      userId: diary.userId ?? diary.user_id ?? 'default-user',
      title: diary.title ?? '',
      content: {
        original: originalContent.text,
        structured: structuredContent.text || undefined,
        final: finalContent.text || undefined,
      },
      date: diary.date ?? now.split('T')[0],
      tags: normalizeStringArray(diary.tags),
      images,
      footerImages: normalizeImageArray(diary.footerImages ?? diary.footer_images),
      aiAnalysis: diary.aiAnalysis ?? diary.analysis,
      createdAt: diary.createdAt ?? diary.created_at ?? now,
      updatedAt: diary.updatedAt ?? diary.updated_at ?? now,
      deletedAt: diary.deletedAt ?? diary.deleted_at ?? null,
      _dirty: dirtyOverride ?? diary._dirty ?? 0,
    },
    migratedLegacyImages,
  }
}

export const useDiaryStore = create<DiaryState>()(
  immer((set, get) => ({
    diaries: {},
    isLoading: false,
    currentDiaryId: null,

    loadDiaries: async () => {
      set({ isLoading: true })
      try {
        const allDiaries = await db.diaries.toArray()
        const migratedEntries: DiaryEntry[] = []

        const diariesMap = allDiaries.reduce<Record<string, DiaryEntry>>((result, diary) => {
          const { entry: normalizedEntry, migratedLegacyImages } = normalizeDiaryRecord(diary)
          const entry = {
            ...normalizedEntry,
            _dirty: diary._dirty === 1 || migratedLegacyImages ? 1 : diary._dirty ?? 0,
          }

          if (migratedLegacyImages) {
            migratedEntries.push(entry)
          }

          result[entry.id] = entry
          return result
        }, {})

        if (migratedEntries.length > 0) {
          await db.diaries.bulkPut(migratedEntries)
        }

        set({ diaries: diariesMap })
      } finally {
        set({ isLoading: false })
      }
    },

    pullDiaries: async () => {
      set({ isLoading: true })
      try {
        const userId = 'default-user'
        const cloudDiaries = await pullDiariesAction(userId)

        if (cloudDiaries && cloudDiaries.length > 0) {
          const localFormatDiaries = cloudDiaries.map((diary: CloudDiaryPayload) => {
            const { entry, migratedLegacyImages } = normalizeDiaryRecord(diary)
            return {
              ...entry,
              _dirty: migratedLegacyImages ? 1 : 0,
            }
          })

          await db.diaries.bulkPut(localFormatDiaries)
        }

        await get().loadDiaries()
      } catch (err) {
        console.error('[DiaryStore] Pull failed:', err)
        await get().loadDiaries()
      } finally {
        set({ isLoading: false })
      }
    },

    setCurrentDiary: (id) => {
      set({ currentDiaryId: id })
    },

    upsertDiary: async (diaryUpdate) => {
      if (!diaryUpdate.id) return

      const now = new Date().toISOString()
      const existingDiary = get().diaries[diaryUpdate.id]
      const { entry: updatedDiary } = normalizeDiaryRecord(
        {
          ...(existingDiary ?? {
            id: diaryUpdate.id,
            userId: 'default-user',
            title: '',
            content: { original: '' },
            date: now.split('T')[0],
            images: [],
            footerImages: [],
            createdAt: now,
          }),
          ...diaryUpdate,
          updatedAt: now,
          _dirty: 1,
        },
        1
      )

      set((state) => {
        state.diaries[updatedDiary.id] = updatedDiary
      })

      await db.diaries.put(updatedDiary)
    },

    deleteDiary: async (id) => {
      set((state) => {
        delete state.diaries[id]
      })

      await db.diaries.update(id, {
        deletedAt: new Date().toISOString(),
        _dirty: 1,
      })
    },

    addDiary: async () => {
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const { entry: newDiary } = normalizeDiaryRecord(
        {
          id,
          userId: 'default-user',
          title: '新日记',
          content: { original: '' },
          date: now.split('T')[0],
          images: [],
          footerImages: [],
          createdAt: now,
          updatedAt: now,
          _dirty: 1,
        },
        1
      )

      set((state) => {
        state.diaries[id] = newDiary
      })

      await db.diaries.put(newDiary)
      return id
    },

    saveAnalysis: async (id, analysis) => {
      const existingDiary = get().diaries[id]
      if (!existingDiary) return

      const now = new Date().toISOString()
      const { entry: updatedDiary } = normalizeDiaryRecord(
        {
          ...existingDiary,
          aiAnalysis: analysis,
          updatedAt: now,
          _dirty: 1,
        },
        1
      )

      set((state) => {
        state.diaries[id] = updatedDiary
      })

      await db.diaries.put(updatedDiary)
    },

    saveStructuredVersion: async (id, structured) => {
      const existingDiary = get().diaries[id]
      if (!existingDiary) return

      const now = new Date().toISOString()
      const { entry: updatedDiary } = normalizeDiaryRecord(
        {
          ...existingDiary,
          content: {
            ...existingDiary.content,
            structured,
          },
          updatedAt: now,
          _dirty: 1,
        },
        1
      )

      set((state) => {
        state.diaries[id] = updatedDiary
      })

      await db.diaries.put(updatedDiary)
    },
  }))
)
