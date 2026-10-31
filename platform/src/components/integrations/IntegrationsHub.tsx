import { ar } from "@/lib/i18n/ar";

interface ProviderCard {
  id: string;
  nameAr: string;
  capabilities: { availability: boolean; rates: boolean; bookings: boolean; twoWay: boolean };
  requirementsAr: string[];
  icalAvailableNow: boolean;
  notesAr?: string;
  dbStatus: "inactive" | "active" | "error";
  lastSyncOkAt: string | null;
}

/**
 * بطاقات مركز التكاملات — عرض صادق:
 * الحالة تُقرأ من قاعدة البيانات (inactive افتراضيًا) ولا تُضبط active إلا بعد اختبار موثق.
 */
export default function IntegrationsHub({ providers }: { providers: ProviderCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {providers.map((p) => (
        <div key={p.id} className="rounded-xl border border-line bg-offwhite p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-teal-deep">{p.nameAr}</h3>
            <span
              className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs ${
                p.dbStatus === "active"
                  ? "bg-teal/10 text-teal"
                  : p.dbStatus === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-line text-muted"
              }`}
            >
              {p.dbStatus === "active"
                ? ar.integrations.status.active
                : p.dbStatus === "error"
                  ? ar.integrations.status.error
                  : ar.integrations.status.inactive}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
            <span className={`rounded-full px-2 py-0.5 ${p.capabilities.availability ? "bg-teal/10 text-teal" : "bg-mist text-muted"}`}>
              توافر
            </span>
            <span className={`rounded-full px-2 py-0.5 ${p.capabilities.rates ? "bg-teal/10 text-teal" : "bg-mist text-muted"}`}>
              أسعار
            </span>
            <span className={`rounded-full px-2 py-0.5 ${p.capabilities.bookings ? "bg-teal/10 text-teal" : "bg-mist text-muted"}`}>
              حجوزات
            </span>
            <span className={`rounded-full px-2 py-0.5 ${p.capabilities.twoWay ? "bg-teal/10 text-teal" : "bg-mist text-muted"}`}>
              ثنائي الاتجاه
            </span>
          </div>

          {p.dbStatus === "inactive" && (
            <div className="mt-3">
              <p className="text-xs font-medium text-muted">{ar.integrations.requirements}:</p>
              <ul className="mt-1 list-disc space-y-0.5 ps-4 text-xs text-muted">
                {p.requirementsAr.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {p.lastSyncOkAt && (
            <p className="mt-2 text-xs text-teal">
              {ar.integrations.lastSyncOk}: {new Date(p.lastSyncOkAt).toLocaleString("ar-SA")}
            </p>
          )}

          {p.notesAr && <p className="mt-3 text-xs leading-relaxed text-muted">{p.notesAr}</p>}

          {p.icalAvailableNow && (
            <p className="mt-2 rounded-lg bg-mist px-3 py-2 text-xs text-teal-deep">
              ✓ {ar.integrations.icalAvailableNow} — {ar.integrations.availabilityOnly}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
