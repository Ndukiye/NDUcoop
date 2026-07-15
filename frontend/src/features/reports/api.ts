import { delay } from "../../mocks/delay";
import { reportJobs, memberReportJobs, addReportJob, reportTypes, type MockReportJob } from "../../mocks/reports";

export async function fetchReportJobs(): Promise<MockReportJob[]> {
  return delay(reportJobs);
}

export async function fetchMyReportJobs(): Promise<MockReportJob[]> {
  return delay(memberReportJobs);
}

export async function generateReport(input: {
  reportType: string;
  format: "PDF" | "EXCEL";
  periodLabel: string;
  scope: "COOPERATIVE" | "MEMBER";
  generatedBy: string;
  memberId?: number;
}): Promise<MockReportJob> {
  return delay(
    addReportJob({
      report_type: input.reportType,
      format: input.format,
      period_label: input.periodLabel,
      generated_at: new Date().toISOString(),
      generated_by: input.generatedBy,
      scope: input.scope,
      member_id: input.memberId ?? null,
    }),
    300,
  );
}

export { reportTypes };
