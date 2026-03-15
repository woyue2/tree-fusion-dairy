/**
 * [INPUT]:    依赖 useDiaryStore, lucide-react, date-fns
 * [OUTPUT]:   导出 DiaryEditor 供 DiaryContainer 使用
 * [POS]:      components/diary/DiaryEditor.tsx - 日记全屏编辑器
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import { useState } from 'react';
import { useDiaryStore } from '@/hooks/useDiaryStore';
import { ChevronLeft, Save, Sparkles, Layout, FileText, CheckCircle2, Cloud, CloudOff, X, ArrowRight, Wand2, BookOpen } from 'lucide-react';
import { DiaryEntry, DiaryContent } from '@/types';
import { analyzeDiaryAction, optimizeStructureAction } from '@/app/actions/ai';
import { toast } from 'sonner';
import { DiaryViewer } from './DiaryViewer';

interface DiaryEditorProps {
  id: string;
  isOnline: boolean;
}

export function DiaryEditor({ id, isOnline }: DiaryEditorProps) {
  const { diaries, upsertDiary, setCurrentDiary, saveAnalysis, saveStructuredVersion } = useDiaryStore();
  const diary = diaries[id];
  
  const [activeTab, setActiveTab] = useState<keyof DiaryContent>('original');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [tempStructure, setTempStructure] = useState('');

  if (!diary) return null;

  const handleUpdate = (updates: Partial<DiaryEntry>) => {
    upsertDiary({ id, ...updates });
  };

  const handleContentChange = (val: string) => {
    const newContent = { ...diary.content, [activeTab]: val };
    handleUpdate({ content: newContent });
  };

  const handleRunAnalysis = async () => {
    if (!diary.content.original) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeDiaryAction(diary.content.original);
      await saveAnalysis(id, result);
      handleUpdate({ title: result.title || diary.title });
      setShowAnalysisModal(true);
      toast.success('情感分析完成');
    } catch (err: any) {
      toast.error('分析失败: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunOptimization = async () => {
    if (!diary.content.original) return;
    setIsAnalyzing(true);
    try {
      const result = await optimizeStructureAction(diary.content.original);
      setTempStructure(result);
      setShowStructureModal(true);
      toast.success('结构优化完成');
    } catch (err: any) {
      toast.error('优化失败: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyOptimization = async () => {
    await saveStructuredVersion(id, tempStructure);
    setActiveTab('structured');
    setShowStructureModal(false);
    toast.success('已应用到结构化版本');
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-[#0f172a] z-50 flex flex-col animate-in fade-in slide-in-from-right-8 duration-500">
      {/* Top Bar */}
      <header className="h-16 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentDiary(null)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={diary.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="日记标题..."
            className="text-xl font-bold bg-transparent outline-none border-none focus:ring-0 w-64 md:w-96"
          />
        </div>

        <div className="flex items-center gap-2">
          {isOnline ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              <Cloud className="w-3 h-3" /> Cloud Ready
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full uppercase tracking-tighter">
              <CloudOff className="w-3 h-3" /> Local Only
            </span>
          )}
          <button
            onClick={() => setShowViewer(true)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors flex items-center gap-1"
            title="沉浸式阅读"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold hidden md:inline">阅读模式</span>
          </button>
          <button
            onClick={() => setCurrentDiary(null)}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            完成退出
          </button>
        </div>
      </header>

      {/* Editor Content */}
      <main className="flex-grow flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 overflow-hidden">
        {/* Left Side: Editor */}
        <div className="flex-grow flex flex-col min-w-0">
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
            {(['original', 'structured', 'final'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={tab !== 'original' && !diary.content[tab]}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30'
                }`}
              >
                <div className="flex items-center justify-center gap-2 capitalize">
                  {tab === 'original' && <FileText className="w-4 h-4" />}
                  {tab === 'structured' && <Layout className="w-4 h-4" />}
                  {tab === 'final' && <Save className="w-4 h-4" />}
                  {tab}
                </div>
              </button>
            ))}
          </div>
          
          <textarea
            value={diary.content[activeTab] || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={activeTab === 'original' ? "在这里开始书写你的故事..." : "等待 AI 生成版本..."}
            className="flex-grow p-8 md:p-12 text-lg bg-transparent outline-none border-none focus:ring-0 resize-none leading-relaxed font-serif"
          />
        </div>

        {/* Right Side: Sidebar/AI Panel */}
        <aside className="w-full md:w-80 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm overflow-y-auto p-6 space-y-8 flex flex-col">
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">AI 赋能</h4>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !isOnline || !diary.content.original}
                className="w-full group bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className={`w-5 h-5 ${isAnalyzing ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
                  <span className="font-bold">情感改写</span>
                </div>
              </button>

              <button
                onClick={handleRunOptimization}
                disabled={isAnalyzing || !isOnline || !diary.content.original}
                className="w-full group bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <div className="flex items-center justify-center gap-3">
                  <Wand2 className={`w-5 h-5 ${isAnalyzing ? 'animate-bounce' : ''}`} />
                  <span className="font-bold">结构优化</span>
                </div>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">由 GLM-4 强力驱动 · 复刻自 Diary-App</p>
          </section>

          {/* Analysis Results Preview */}
          {diary.aiAnalysis && (
            <section className="bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl">
              <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> 分析结果
              </h4>
              <p className="text-sm font-medium italic text-indigo-700 dark:text-indigo-300">
                &ldquo;{diary.aiAnalysis.title}&rdquo;
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button 
                  onClick={() => setShowAnalysisModal(true)}
                  className="text-[10px] text-indigo-500 hover:underline font-bold text-left"
                >
                  查看详细情绪地图 →
                </button>
              </div>
            </section>
          )}

          <section className="flex-grow">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">元数据</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400">创作日期</label>
                <input 
                  type="date" 
                  value={diary.date}
                  onChange={(e) => handleUpdate({ date: e.target.value })}
                  className="w-full mt-1 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
              </div>
              
              <div>
                 <label className="text-xs font-medium text-slate-500 dark:text-slate-400">标签</label>
                 <div className="flex flex-wrap gap-2 mt-2">
                   {(diary.tags || []).map(tag => (
                     <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">#{tag}</span>
                   ))}
                   <button className="text-[10px] border border-dashed border-slate-300 dark:border-slate-700 px-2 py-1 rounded-md text-slate-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors">
                     + 新标签
                   </button>
                 </div>
              </div>
            </div>
          </section>
          <footer className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>最后修改: {new Date(diary.updatedAt).toLocaleTimeString()}</span>
            <span>字数: {diary.content[activeTab]?.length || 0}</span>
          </footer>
        </aside>
      </main>

      {/* Analysis UI Modal */}
      {showAnalysisModal && diary.aiAnalysis && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAnalysisModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">情绪分析与改写建议</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Emotional Mapping</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAnalysisModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-tight">AI 建议标题</h4>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{diary.aiAnalysis.title}</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight">情绪对应表</h4>
                {diary.aiAnalysis.analysis?.map((item: any, idx: number) => (
                  <div key={idx} className={`p-4 rounded-2xl border ${item.is_negative ? 'bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${item.is_negative ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <div className="space-y-2">
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">{item.sentence}</p>
                        {item.is_negative && (
                          <div className="pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase mb-1 flex items-center gap-1">
                              <Wand2 className="w-3 h-3" /> 改写建议
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{item.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-4 text-center">改写预览 (Rewritten Version)</h4>
                <div className="p-6 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl italic font-serif text-slate-600 dark:text-slate-400 leading-relaxed">
                  {diary.aiAnalysis.rewritten_version}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => {
                  handleUpdate({ content: { ...diary.content, final: diary.aiAnalysis.rewritten_version } });
                  setActiveTab('final');
                  setShowAnalysisModal(false);
                  toast.success('已存入最终版 (Final Version)');
                }}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                应用改写至最终版
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Structure Optimization Modal */}
      {showStructureModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowStructureModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                  <Layout className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">结构优化与知识树</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Structure Optimization</p>
                </div>
              </div>
              <button onClick={() => setShowStructureModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tight">原文对比</h4>
                <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed opacity-60 line-clamp-20">
                  {diary.content.original}
                </div>
              </div>
              <div className="p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-800/30 space-y-6 flex flex-col">
                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> 优化预览
                </h4>
                <pre className="flex-grow text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {tempStructure}
                </pre>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowStructureModal(false)}
                className="px-6 py-3 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                放弃修改
              </button>
              <button 
                onClick={applyOptimization}
                className="px-8 py-3 rounded-2xl text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl shadow-slate-900/20"
              >
                应用优化到结构化版本
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewer && (
        <DiaryViewer 
          diary={diary} 
          onClose={() => setShowViewer(false)} 
        />
      )}
    </div>
  );
}
