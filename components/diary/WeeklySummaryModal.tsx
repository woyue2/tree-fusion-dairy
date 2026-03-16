/**
 * [INPUT]:    onClose
 * [OUTPUT]:   AI Weekly Summary Multi-step Modal
 * [POS]:      components/diary/WeeklySummaryModal.tsx - AI Feature Component
 * [PROTOCOL]: Simulates AI analysis steps and displays summary results.
 */
'use client';

import React, { useState } from 'react';
import { X, Check, Calendar, ChevronRight, ChevronLeft, Sparkles, Loader2 } from 'lucide-react';

interface WeeklySummaryModalProps {
  onClose: () => void;
}

export default function WeeklySummaryModal({ onClose }: WeeklySummaryModalProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setStep(3);
      setIsGenerating(false);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[600px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-bottom flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <Sparkles size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-800">AI 智能周报回顾</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-12 py-6 flex items-center justify-between relative">
          <div className="absolute top-[50%] left-12 right-12 h-0.5 bg-slate-100 -z-10" />
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                step >= s ? 'bg-[#c9481d] text-white' : 'bg-slate-100 text-slate-400'
              } ${step === s ? 'ring-4 ring-orange-50' : ''}`}
            >
              {step > s ? <Check size={14} /> : s}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600">请选择您想要回顾的日期范围</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-[#c9481d] bg-orange-50/30 rounded-xl cursor-not-allowed">
                  <div className="text-xs font-medium text-orange-600 mb-1">最近 7 天</div>
                  <div className="text-sm font-bold text-slate-800">本周总结 (默认)</div>
                </div>
                <div className="flex justify-center items-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 italic text-slate-400">
                  &ldquo;让 AI 审视你的一周时光&rdquo;
                </div>
              </div>
              <div className="mt-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">包含的日记 (5)</h4>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-50/50 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-300" />
                      <div className="text-xs text-slate-500 w-24">2026-03-{10+i}</div>
                      <div className="text-xs font-medium text-slate-700 truncate">模拟日记标题 {i}...</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-12">
              {isGenerating ? (
                <>
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-[#c9481d] rounded-full animate-spin" />
                    <Sparkles className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500" size={30} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">正在进行跨维度分析</h3>
                  <p className="text-sm text-slate-500 max-w-[300px] text-center">
                    正在分析您的感情趋势、核心话题以及成长轨迹...
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">一切准备就绪</h3>
                  <p className="text-sm text-slate-500 mb-8 text-center">
                    我们的 AI 将为您提取本周的关键见解
                  </p>
                  <button 
                    onClick={handleGenerate}
                    className="px-10 py-3 bg-[#c9481d] text-white rounded-xl hover:bg-[#b03e18] shadow-lg shadow-orange-200 transition-all active:scale-95 font-bold"
                  >
                    立即生成回顾报告
                  </button>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-6">
                <h3 className="text-xl font-black text-slate-900 mb-4 ">🌟 本周回顾摘要</h3>
                <div className="prose prose-sm text-slate-700 leading-relaxed font-inter">
                  <p>本周您的整体情绪指标处于 <strong>7.5/10</strong> 的水平，相较上周有明显平稳提升。主要讨论的话题集中在 <strong>#项目重构</strong> 和 <strong>#生活节奏调整</strong>。</p>
                  <p>核心洞察：您在周三的记录中表现出了极高的决策效率，建议在下周继续保持清晨写作的习惯，这对维持思维清晰度有显著帮助。</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">情绪趋势</div>
                  <div className="text-sm font-bold text-green-600">稳步上升 ↑</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">最高频词</div>
                  <div className="text-sm font-bold text-slate-800">&ldquo;突破&rdquo; / &ldquo;专注&rdquo;</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-top flex items-center justify-end gap-3 bg-slate-50/30">
          {step === 1 && (
            <button 
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-bold"
            >
              下一步 <ChevronRight size={16} />
            </button>
          )}
          {step === 2 && !isGenerating && (
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
            >
              返回重选
            </button>
          )}
          {step === 3 && (
            <>
              <button 
                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-bold"
              >
                保存为日记
              </button>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-bold"
              >
                完成
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
