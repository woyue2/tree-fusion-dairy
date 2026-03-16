/**
 * [INPUT]:    Supabase session (User Auth)
 * [OUTPUT]:   Diary List SSR Page Shell
 * [POS]:      app/(private)/diary/page.tsx - Diary Module Route
 * [PROTOCOL]: Renders metadata and DiaryContainer for private diary access.
 */

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diary · Tree-Fusion-Diary',
  description: '日记本 — 记录今天发生的事',
}

import DiaryContainer from '@/components/diary/DiaryContainer'

export default async function DiaryPage() {
  return (
    <DiaryContainer />
  )
}

