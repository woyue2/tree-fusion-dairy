/**
 * [INPUT]:    AI Prompts, ZHIPU_AI_API_KEY
 * [OUTPUT]:   Server-side AI analysis & structure optimization
 * [POS]:      app/actions/ai.ts - AI Logic Layer
 * [PROTOCOL]: Ported from diary-app, using GLM-4 for transformation.
 */
'use server'

const ZHIPU_API_KEY = process.env.ZHIPU_AI_API_KEY
const BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

async function callZhipuAI(systemPrompt: string, userContent: string) {
  if (!ZHIPU_API_KEY) {
    throw new Error('ZHIPU_AI_API_KEY is not configured')
  }

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ZHIPU_API_KEY}`
    },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: systemPrompt.includes('JSON') ? { type: 'json_object' } : undefined
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `AI API request failed: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

export async function analyzeDiaryAction(content: string) {
  const systemPrompt = `你是一个情感分析助手，专门分析用户日记内容并提供积极的改写建议。

任务要求：
1. 根据日记内容生成一个诗意的标题（4-8个字，简短有意境）
2. 将用户日记按句子分割（非常重要！即使是连在一起的段落，也要根据标点和语义拆分成独立的句子）
3. 识别表达负面情绪的句子（悲伤、焦虑、愤怒、沮丧、绝望等）
4. 对每个负面句子提供积极的改写建议，保持原意但转换表达方式
5. 整体改写版本应该保留原文结构，只将负面表达转换为积极表达

请用JSON格式返回结果，结构如下：
{
  "title": "诗意标题（4-8个字）",
  "sentences": ["句子1", "句子2", "句子3", ...],
  "analysis": [
    {
      "index": 0,
      "sentence": "原句",
      "is_negative": true/false,
      "reason": "如果是负面句，说明原因",
      "suggestion": "改写建议"
    }
  ],
  "rewritten_version": "完整改写版本，保留原文结构，只将负面句子转换为积极表达"
}

注意：
- 标题要有诗意，可以用比喻、意象等手法
- 分句是最重要的步骤：每个句子应该完整表达一个意思，长度适中
- 即使原文是连在一起的一大段，也要拆分成多个独立句子
- rewritten_version应该尽量保持原文长度和结构
- 遇到形如 img:...png 的图片标记文本时，请保持原样，不要改写或删除`

  try {
    const result = await callZhipuAI(systemPrompt, content)
    return JSON.parse(result)
  } catch (error: any) {
    console.error('AI Analysis Error:', error)
    throw new Error(error.message)
  }
}

export async function optimizeStructureAction(content: string) {
  const systemPrompt = `你是一名写作结构优化助手。
任务要求：
1. 在不改变原文语义的前提下，优化结构与表达，让内容更清晰有条理
2. 保留原文的信息与情感，不增加虚构内容
3. 不要输出标题、编号或多余说明

输出格式（分为三部分，第二部分第三部分用长横线分隔）：

第一部分 - 要点提取（子弹笔记格式）：
- 使用简洁的要点概括原文核心内容
- 每个要点简明扼要，一行一个
- 使用数字标示，分类为大点1，小点为1.1  
- 保留关键信息和情感色彩

-------------------------------------------

第二部分 - 优化正文：
以分段形式输出，段落之间用换行分隔

-------------------------------------------

第三部分 - 目录树：
使用"目录树:"作为标题
目录树格式类似 Linux tree，使用 ├──、└──、│ 表示层级
仅输出以上三部分内容，不要包含JSON或代码块。`

  try {
    return await callZhipuAI(systemPrompt, content)
  } catch (error: any) {
    console.error('AI Structure Error:', error)
    throw new Error(error.message)
  }
}
