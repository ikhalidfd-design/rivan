import { redirect } from "next/navigation";

export default function Home() {
  // مؤقتًا: الصفحة الجذرية تحوّل إلى صفحة الدخول حتى نبني الوجهة النهائية
  redirect("/login");
}
