import type { QrReportRow } from "@/types/qr-report";

const QR_REPORT_TEMPLATE_PATH = "/reports/qr-report.mrt";

type StimulsoftQrRow = {
  name: string;
  number: string;
  mac: string;
};

function cleanFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").trim();
}

function getSafeValue(value: string | undefined | null) {
  const safe = value?.trim();
  return safe && safe !== "-" ? safe : "";
}

function mapRowsToStimulsoftList(rows: QrReportRow[]): StimulsoftQrRow[] {
  return rows.map((row) => ({
    name: getSafeValue(row.faTitle) || getSafeValue(row.fullName) || "-",
    number: getSafeValue(row.number) || "-",
    mac: getSafeValue(row.mac) || "-",
  }));
}

async function loadStimulsoft() {
  if (typeof window === "undefined") {
    throw new Error("Stimulsoft فقط سمت مرورگر قابل اجراست.");
  }

  const reportsModule = await import("stimulsoft-reports-js/Scripts/stimulsoft.reports");
  const viewerModule = await import("stimulsoft-reports-js/Scripts/stimulsoft.viewer");

  const Stimulsoft =
    (viewerModule as any).Stimulsoft ||
    (reportsModule as any).Stimulsoft ||
    (window as any).Stimulsoft;

  if (!Stimulsoft) {
    throw new Error("کتابخانه Stimulsoft به درستی لود نشد.");
  }

  return Stimulsoft;
}

export async function exportQrRowsToPdf(
  rows: QrReportRow[],
  fileName = "qr-report.pdf"
) {
  if (typeof window === "undefined") {
    throw new Error("خروجی گزارش باید سمت مرورگر ساخته شود.");
  }

  if (!rows.length) {
    throw new Error("دیتایی برای ساخت گزارش وجود ندارد.");
  }

  const Stimulsoft = await loadStimulsoft();

  const report = new Stimulsoft.Report.StiReport();

  report.loadFile(QR_REPORT_TEMPLATE_PATH);

  const dataSet = new Stimulsoft.System.Data.DataSet("Medical");

  dataSet.readJson(
    JSON.stringify({
      list: mapRowsToStimulsoftList(rows),
    })
  );

  report.dictionary.databases.clear();
  report.regData("Medical", "Medical", dataSet);
  report.dictionary.synchronize();

  await new Promise<void>((resolve, reject) => {
    try {
      report.renderAsync(() => {
        report.exportDocumentAsync((pdfData: unknown) => {
          Stimulsoft.System.StiObject.saveAs(
            pdfData,
            cleanFileName(fileName),
            "application/pdf"
          );

          resolve();
        }, Stimulsoft.Report.StiExportFormat.Pdf);
      });
    } catch (error) {
      reject(error);
    }
  });
}