import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = 'https://zuhwgoaveukixabgpywd.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aHdnb2F2ZXVraXhhYmdweXdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MjE0NzMsImV4cCI6MjEwNjI5NzQ3M30.2tUNY62ulLsZDZhYVbfRSWLttIwgJjZHRGWonYxwqqM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)
