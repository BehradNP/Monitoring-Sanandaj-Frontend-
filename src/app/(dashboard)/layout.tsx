import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ Layout را LTR می‌کنیم تا Sidebar همیشه ستون راست باشد
    <div className="flex min-h-screen w-full bg-slate-50" dir="ltr">
      {/* ✅ Main همیشه سمت چپ */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50" dir="rtl">
        <Header />
        <div className="flex-1 overflow-y-auto px-8 py-6">
  <div className="mx-auto w-full max-w-[2100px]">
    {children}
  </div>
</div>

      </main>

      {/* ✅ Sidebar همیشه سمت راست */}
      <div className="shrink-0" dir="rtl">
        <Sidebar />
      </div>
    </div>
  );
}
