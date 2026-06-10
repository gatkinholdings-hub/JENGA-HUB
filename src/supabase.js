import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lcqrmmlpcmakfqklsice.supabase.co'
const supabaseKey = 'sb_publishable_WWICKpwu5bpUYVVHiqWkBQ_2-qv8XrE'

export const supabase = createClient(supabaseUrl, supabaseKey)