import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ⛔ عميل الخدمة (service-role) — يتجاوز RLS.
 * محصور بالخادم عبر "server-only"؛ يُستخدم حصرًا في:
 *   - عامل الوظائف الخلفية (/api/cron/worker)
 *   - تصدير iCal بالتوكن العام
 *   - كتابة سجلات التدقيق والوظائف
 * ممنوع استيراده في أي ملف يُشغَّل في المتصفح.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
