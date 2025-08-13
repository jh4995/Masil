import { createClient } from '@supabase/supabase-js'

// .env 파일 등을 사용하는 것이 안전하지만, 프로토타입에서는 직접 입력합니다.
const supabaseUrl = 'https://iaoafbljxkrwurhecwxu.supabase.co' // 여기에 복사한 URL을 붙여넣으세요.
const supabaseAnonKey = 'sb_publishable_MAKLu3AUqyy4vYyWRb0iOQ_NY2-zle5' // 여기에 복사한 anon key를 붙여넣으세요.

export const supabase = createClient(supabaseUrl, supabaseAnonKey)