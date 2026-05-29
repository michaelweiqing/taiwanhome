// ============================================================
// lib/supabase.ts
// Khởi tạo Supabase client – dùng chung toàn project
// ============================================================
// Cách dùng:
//   import { supabase } from "@/lib/supabase"
//   const { data } = await supabase.from("properties").select("*")
// ============================================================

import { createClient } from "@supabase/supabase-js"

// Hai biến này lấy từ file .env.local (xem hướng dẫn bên dưới)
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Tạo 1 client dùng chung (singleton pattern)
export const supabase = createClient(supabaseUrl, supabaseKey)
