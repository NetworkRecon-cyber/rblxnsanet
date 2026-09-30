import { supabase } from './supabase'

export type FeedTag = 'AUTH' | 'VAULT' | 'ALERT' | 'COMMS'
export type FeedDot = 'blue' | 'amber' | 'red' | 'green'

export interface FeedEvent {
  id?:        number
  time:       string
  dot:        FeedDot
  text:       string
  tag:        FeedTag
  created_at?: string
}

const TAG_DOT: Record<FeedTag, FeedDot> = {
  AUTH:  'blue',
  VAULT: 'amber',
  ALERT: 'red',
  COMMS: 'green',
}

export async function logFeedEvent(text: string, tag: FeedTag): Promise<void> {
  const now = new Date()
  const time = now.toISOString().slice(11, 19) + 'Z'
  try {
    await supabase.from('feed').insert({ time, dot: TAG_DOT[tag], text, tag })
  } catch {}
}

export async function fetchFeed(limit = 20): Promise<FeedEvent[]> {
  try {
    const { data, error } = await supabase
      .from('feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    if (!error && data) return data as FeedEvent[]
  } catch {}
  return []
}

export async function deleteFeedEvent(id: number): Promise<void> {
  try { await supabase.from('feed').delete().eq('id', id) } catch {}
}

export async function insertFeedEvent(event: Omit<FeedEvent, 'id' | 'created_at'>): Promise<void> {
  try { await supabase.from('feed').insert(event) } catch {}
}
