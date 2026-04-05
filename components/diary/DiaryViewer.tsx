/**
 * [INPUT]:    依赖 diaryEntry, onClose, navigation actions, renderMarkdown
 * [OUTPUT]:   全屏沉浸式阅读器组件，直接消费结构化图片字段
 * [POS]:      components/diary/DiaryViewer.tsx - 沉浸式消费层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Type, Clock, Calendar, Download } from 'lucide-react'
import { DiaryEntry, DiaryContent } from '@/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { renderMarkdown } from '@/lib/utils'

interface DiaryViewerProps {
  diary: DiaryEntry
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}

function getViewerText(content: DiaryContent, activeTab: keyof DiaryContent): string {
  return content[activeTab] || ''
}

interface DiaryViewerImageSectionProps {
  images: string[]
  title?: string
}

function DiaryViewerImageSection({ images, title }: DiaryViewerImageSectionProps) {
  if (images.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      {title && <div className="diary-image-section-label">{title}</div>}
      <div className="diary-viewer-image-grid">
        {images.map((url) => (
          <Image
            key={url}
            src={url}
            alt={title || '日记图片'}
            width={1200}
            height={900}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="diary-viewer-image"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        ))}
      </div>
    </section>
  )
}

export function DiaryViewer({ diary, onClose, onPrev, onNext }: DiaryViewerProps) {
  const [activeTab, setActiveTab] = useState<keyof DiaryContent>('original')
  const [fontSize, setFontSize] = useState<number>(18)
  const [lineHeight, setLineHeight] = useState<number>(1.8)

  const availableTabs: (keyof DiaryContent)[] = ['original']
  if (diary.content.structured) availableTabs.push('structured')
  if (diary.content.final) availableTabs.push('final')

  const viewerText = getViewerText(diary.content, activeTab)

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-300">
      <header className="h-20 flex items-center justify-between px-8 border-b border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{diary.title || '无标题记录'}</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(diary.date), 'yyyy年MM月dd日', { locale: zhCN })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="导出日记">
              <Download className="w-5 h-5" />
            </button>
            <div className="group relative">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500" title="排版设置">
                <Type className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 scale-95 group-hover:scale-100 origin-top-right">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">字号: {fontSize}px</label>
                    <input
                      type="range"
                      min="14"
                      max="32"
                      value={fontSize}
                      onChange={(event) => setFontSize(parseInt(event.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">行高: {lineHeight}</label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.4"
                      step="0.1"
                      value={lineHeight}
                      onChange={(event) => setLineHeight(parseFloat(event.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto flex justify-center bg-slate-50/30 dark:bg-slate-950/30">
        <article
          className="w-full max-w-3xl px-8 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-700"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <DiaryViewerImageSection images={diary.images ?? []} title="顶部图片" />

          <div
            className={`text-slate-800 dark:text-slate-200 leading-relaxed ${
              activeTab === 'structured'
                ? 'font-mono bg-slate-100/50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800'
                : 'font-serif first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:mt-1'
            }`}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(viewerText) }}
          />

          <DiaryViewerImageSection images={diary.footerImages ?? []} title="底部图片" />

          <footer className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>创作耗时: 约 {Math.max(1, Math.ceil((diary.content.original || '').length / 50))} 分钟</span>
              </div>
              <span>字数: {viewerText.length}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(diary.tags || []).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded-md text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </footer>
        </article>
      </main>

      <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex">
        <button
          onClick={onPrev}
          disabled={!onPrev}
          className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xl disabled:opacity-20"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex">
        <button
          onClick={onNext}
          disabled={!onNext}
          className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-xl disabled:opacity-20"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  )
}
