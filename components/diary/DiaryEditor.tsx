/**
 * [INPUT]:    id, isOnline, useDiaryStore, analyzeDiaryAction, uploadImageAction
 * [OUTPUT]:   Interactive Diary Editor with structured images + AI Panel
 * [POS]:      components/diary/DiaryEditor.tsx - Diary Editor View
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { useDiaryStore } from '@/hooks/useDiaryStore'
import {
  Bold,
  BookOpen,
  ImagePlus,
  Images,
  Italic,
  Link,
  List,
  Loader2,
  MessageSquare,
  Quote,
  RefreshCw,
  Settings,
  Sparkles,
  Type,
  Wand2,
  X,
} from 'lucide-react'
import { DiaryContent, DiaryEntry } from '@/types'
import { analyzeDiaryAction } from '@/app/actions/ai'
import { uploadImageAction } from '@/app/actions/upload'
import { toast } from 'sonner'

interface DiaryEditorProps {
  id: string
  isOnline: boolean
  onOpenViewer?: (id: string) => void
}

type DiaryImageTarget = 'images' | 'footerImages'

type UploadStatus = {
  kind: 'idle' | 'uploading' | 'error'
  target?: DiaryImageTarget
  message?: string
}

const IMAGE_TARGET_LABEL: Record<DiaryImageTarget, string> = {
  images: '顶部图片',
  footerImages: '底部图片',
}

function getDiaryText(content: DiaryContent, activeTab: keyof DiaryContent): string {
  return content[activeTab] || ''
}

function getImageList(diary: DiaryEntry, target: DiaryImageTarget): string[] {
  return target === 'images' ? diary.images ?? [] : diary.footerImages ?? []
}

interface DiaryImageSectionProps {
  images: string[]
  label: string
  onRemove: (url: string) => void
}

function DiaryImageSection({ images, label, onRemove }: DiaryImageSectionProps) {
  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="diary-image-section-label">{label}</div>
      <div className="diary-image-grid">
        {images.map((url) => (
          <div key={url} className="diary-image-card group">
            <Image src={url} alt={label} fill sizes="120px" className="object-cover" />
            <button
              type="button"
              onClick={() => onRemove(url)}
              className="diary-image-remove"
              title={`移除${label}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DiaryEditor({ id, isOnline, onOpenViewer }: DiaryEditorProps) {
  const diaries = useDiaryStore((state) => state.diaries)
  const upsertDiary = useDiaryStore((state) => state.upsertDiary)
  const saveAnalysis = useDiaryStore((state) => state.saveAnalysis)
  const diary = diaries[id]

  const [activeTab, setActiveTab] = useState<keyof DiaryContent>('original')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [showSidePanel, setShowSidePanel] = useState(true)
  const [uploadTarget, setUploadTarget] = useState<DiaryImageTarget>('images')
  const uploadTargetRef = useRef<DiaryImageTarget>('images')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ kind: 'idle' })
  const [retryUpload, setRetryUpload] = useState<{ file: File; target: DiaryImageTarget } | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  if (!diary) return null

  const isUploading = uploadStatus.kind === 'uploading'

  const handleUpdate = (updates: Partial<DiaryEntry>) => {
    upsertDiary({ id, ...updates })
  }

  const handleContentChange = (value: string) => {
    handleUpdate({
      content: {
        ...diary.content,
        [activeTab]: value,
      },
    })
  }

  const updateImageCollection = (target: DiaryImageTarget, nextImages: string[]) => {
    if (target === 'images') {
      handleUpdate({ images: nextImages })
      return
    }

    handleUpdate({ footerImages: nextImages })
  }

  const appendUploadedImage = (target: DiaryImageTarget, imageUrl: string) => {
    const currentImages = getImageList(diary, target)
    if (currentImages.includes(imageUrl)) {
      toast.success('图片已存在')
      return
    }

    updateImageCollection(target, [...currentImages, imageUrl])
    toast.success(`${IMAGE_TARGET_LABEL[target]}上传成功`)
  }

  const performImageUpload = async (file: File, target: DiaryImageTarget) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('不支持该图片格式')
      return
    }

    setUploadStatus({
      kind: 'uploading',
      target,
      message: `正在上传${IMAGE_TARGET_LABEL[target]}...`,
    })

    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await uploadImageAction(formData)

      if (!result.success || !result.data) {
        throw new Error(result.error || '上传失败')
      }

      appendUploadedImage(target, result.data.url)
      setRetryUpload(null)
      setUploadStatus({ kind: 'idle' })
    } catch (error: any) {
      setRetryUpload({ file, target })
      setUploadStatus({
        kind: 'error',
        target,
        message: error.message || '上传失败，请重试',
      })
      toast.error(`图片上传失败: ${error.message}`)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    await performImageUpload(file, uploadTargetRef.current)
  }

  const openUploadPicker = (target: DiaryImageTarget) => {
    uploadTargetRef.current = target
    setUploadTarget(target)
    imageInputRef.current?.click()
  }

  const handleRetryUpload = async () => {
    if (!retryUpload) {
      return
    }

    await performImageUpload(retryUpload.file, retryUpload.target)
  }

  const handleRemoveImage = (target: DiaryImageTarget, imageUrl: string) => {
    const nextImages = getImageList(diary, target).filter((url) => url !== imageUrl)
    updateImageCollection(target, nextImages)
  }

  const handleRunAnalysis = async () => {
    if (!diary.content.original) return

    setIsAnalyzing(true)
    try {
      const result = await analyzeDiaryAction(diary.content.original)
      await saveAnalysis(id, result)
      handleUpdate({ title: result.title || diary.title })
      setShowAnalysisModal(true)
      toast.success('情感分析完成')
    } catch (error: any) {
      toast.error(`分析失败: ${error.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <div className="diary-toolbar">
          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <button className="toolbar-btn" title="加粗" onClick={() => document.execCommand('bold', false)}>
              <Bold size={16} />
            </button>
            <button className="toolbar-btn" title="斜体" onClick={() => document.execCommand('italic', false)}>
              <Italic size={16} />
            </button>
            <button className="toolbar-btn" title="引用" onClick={() => document.execCommand('formatBlock', false, 'BLOCKQUOTE')}>
              <Quote size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <button className="toolbar-btn" title="无序列表" onClick={() => document.execCommand('insertUnorderedList', false)}>
              <List size={16} />
            </button>
            <button className="toolbar-btn" title="标题" onClick={() => document.execCommand('formatBlock', false, 'H2')}>
              <Type size={16} />
            </button>
            <button
              className="toolbar-btn"
              title="插入链接"
              onClick={() => {
                const url = prompt('输入链接地址:')
                if (url) document.execCommand('createLink', false, url)
              }}
            >
              <Link size={16} />
            </button>
          </div>

          <div className="flex items-center gap-1 border-r pr-2 mr-2">
            <button
              type="button"
              className="toolbar-btn"
              disabled={isUploading}
              onClick={() => openUploadPicker('images')}
              title="上传顶部图片"
            >
              {isUploading && uploadTarget === 'images' ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              <span className="ml-1">顶部图片</span>
            </button>
            <button
              type="button"
              className="toolbar-btn"
              disabled={isUploading}
              onClick={() => openUploadPicker('footerImages')}
              title="上传底部图片"
            >
              {isUploading && uploadTarget === 'footerImages' ? <Loader2 size={16} className="animate-spin" /> : <Images size={16} />}
              <span className="ml-1">底部图片</span>
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {(['original', 'structured', 'final'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={tab !== 'original' && !diary.content[tab]}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                    activeTab === tab
                      ? 'bg-white text-[#c9481d] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 disabled:opacity-30'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenViewer?.(id)}
              className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-[#c9481d] transition-colors"
              title="阅读模式"
            >
              <BookOpen size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowSidePanel(!showSidePanel)}
              className={`p-2 rounded-lg transition-colors ${showSidePanel ? 'text-[#c9481d] bg-orange-50' : 'text-slate-400 hover:bg-slate-100'}`}
              title="设置与 AI"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        <input
          ref={imageInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {uploadStatus.kind !== 'idle' && (
          <div className="px-12 pt-4">
            <div className="diary-upload-status">
              <div className="flex items-center gap-2">
                {uploadStatus.kind === 'uploading' ? <Loader2 size={16} className="animate-spin" /> : <Images size={16} />}
                <span>{uploadStatus.message}</span>
              </div>
              {uploadStatus.kind === 'error' && retryUpload && (
                <button type="button" onClick={handleRetryUpload} className="toolbar-btn !py-1.5 !px-3">
                  <RefreshCw size={14} />
                  <span className="ml-1">重试</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-12 py-10 space-y-6">
          <input
            type="text"
            value={diary.title}
            onChange={(event) => handleUpdate({ title: event.target.value })}
            placeholder="日记标题..."
            className="w-full text-3xl font-black bg-transparent outline-none border-none focus:ring-0 placeholder:text-slate-200"
          />

          <DiaryImageSection
            images={diary.images ?? []}
            label="顶部图片"
            onRemove={(url) => handleRemoveImage('images', url)}
          />

          <textarea
            value={getDiaryText(diary.content, activeTab)}
            onChange={(event) => handleContentChange(event.target.value)}
            placeholder={activeTab === 'original' ? '在这里开始书写你的故事...' : '等待 AI 生成版本...'}
            className="w-full min-h-[420px] text-lg bg-transparent outline-none border-none focus:ring-0 resize-none leading-relaxed font-serif text-slate-700"
          />

          <DiaryImageSection
            images={diary.footerImages ?? []}
            label="底部图片"
            onRemove={(url) => handleRemoveImage('footerImages', url)}
          />
        </div>
      </div>

      {showSidePanel && (
        <div className="diary-inspector animate-in slide-in-from-right duration-300">
          <div className="p-6 space-y-8 h-full flex flex-col">
            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">日期与元数据</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">记录日期</label>
                  <input
                    type="date"
                    value={diary.date}
                    onChange={(event) => handleUpdate({ date: event.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">图片统计</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-600">
                      顶部图片 {diary.images?.length ?? 0}
                    </div>
                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-slate-600">
                      底部图片 {diary.footerImages?.length ?? 0}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 block">标签</label>
                  <div className="flex flex-wrap gap-2">
                    {(diary.tags || []).map((tag) => (
                      <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                    <button className="text-[10px] border border-dashed border-slate-200 px-2 py-1 rounded text-slate-400 hover:border-orange-500 hover:text-orange-500 transition-colors">
                      + 标签
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">AI 深度赋能</h4>
              <div className="space-y-3">
                <button
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !isOnline || !diary.content.original}
                  className="w-full group bg-gradient-to-br from-[#c9481d] to-[#ff7e5f] text-white p-4 rounded-xl shadow-lg shadow-orange-100 hover:shadow-orange-200 transition-all active:scale-95 disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span className="font-bold text-sm">情感改写</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-tight">基于心理学模型的文字调优，让情绪更精准。</p>
                </button>

                <button
                  disabled={isAnalyzing || !isOnline || !diary.content.original}
                  onClick={async () => {
                    if (!diary.content.original) return
                    setIsAnalyzing(true)
                    try {
                      handleUpdate({ content: { ...diary.content, structured: `知识点提炼示例:\n- ${diary.title}` } })
                      setActiveTab('structured')
                    } finally {
                      setIsAnalyzing(false)
                    }
                  }}
                  className="w-full group bg-white border border-slate-200 text-slate-700 p-4 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 text-left"
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Wand2 className="w-4 h-4 text-[#c9481d]" />
                    <span className="font-bold text-sm">结构化提取</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">从琐碎记录中提取关键知识，同步至知识树。</p>
                </button>
              </div>
            </section>

            {diary.aiAnalysis && (
              <section className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                <h4 className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3 h-3" /> 最新分析
                </h4>
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800">&ldquo;{diary.aiAnalysis.title}&rdquo;</div>
                  <button onClick={() => setShowAnalysisModal(true)} className="text-[10px] text-orange-600 hover:underline font-bold">
                    查看完整情绪地图 →
                  </button>
                </div>
              </section>
            )}

            <div className="mt-auto pt-6 border-t text-[10px] text-slate-400 flex flex-col gap-2">
              <div className="flex justify-between">
                <span>同步状态</span>
                <span className={isOnline ? 'text-green-500 font-bold' : 'text-amber-500 font-bold'}>
                  {isOnline ? '已连接' : '离线记录'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>字数统计</span>
                <span className="font-bold text-slate-600">{getDiaryText(diary.content, activeTab).length} 字</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAnalysisModal && diary.aiAnalysis && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">情绪改写建议</h3>
              <button onClick={() => setShowAnalysisModal(false)}>
                <X />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="text-xs font-bold text-orange-600 mb-2">推荐标题</div>
                <div className="text-sm font-bold">{diary.aiAnalysis.title}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-bold text-slate-400 mb-2">改写预览</div>
                <div className="text-sm italic font-serif leading-relaxed">{diary.aiAnalysis.rewritten_version}</div>
              </div>
            </div>
            <button
              onClick={() => {
                handleUpdate({ content: { ...diary.content, final: diary.aiAnalysis.rewritten_version } })
                setActiveTab('final')
                setShowAnalysisModal(false)
                toast.success('已应用至最终版')
              }}
              className="w-full mt-6 py-3 bg-[#c9481d] text-white rounded-xl font-bold"
            >
              应用改写内容
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
