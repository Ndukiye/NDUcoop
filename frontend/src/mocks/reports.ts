import { logAuditEntry } from "./audit";

export interface MockReportJob {
  id: number;
  report_type: string;
  format: "PDF" | "EXCEL";
  period_label: string;
  generated_at: string;
  generated_by: string;
  scope: "COOPERATIVE" | "MEMBER";
  member_id: number | null;
}

let nextId = 1;

function daysAgo(n: number) {
  return new Date(new Date().setDate(new Date().getDate() - n)).toISOString();
}

export const reportTypes = [
  { value: "MEMBER_STATEMENT", label: "Member Statement" },
  { value: "INCOME_EXPENDITURE", label: "Income & Expenditure" },
  { value: "FINANCIAL_POSITION", label: "Statement of Financial Position" },
  { value: "RECEIPTS_PAYMENTS", label: "Receipts & Payments" },
];

export const reportJobs: MockReportJob[] = [
  {
    id: nextId++,
    report_type: "INCOME_EXPENDITURE",
    format: "PDF",
    period_label: "June 2026",
    generated_at: daysAgo(10),
    generated_by: "Amaka Okafor",
    scope: "COOPERATIVE",
    member_id: null,
  },
  {
    id: nextId++,
    report_type: "FINANCIAL_POSITION",
    format: "EXCEL",
    period_label: "Q2 2026",
    generated_at: daysAgo(15),
    generated_by: "Tunde Bakare",
    scope: "COOPERATIVE",
    member_id: null,
  },
  {
    id: nextId++,
    report_type: "RECEIPTS_PAYMENTS",
    format: "PDF",
    period_label: "May 2026",
    generated_at: daysAgo(40),
    generated_by: "Amaka Okafor",
    scope: "COOPERATIVE",
    member_id: null,
  },
];

export const memberReportJobs: MockReportJob[] = [
  {
    id: nextId++,
    report_type: "MEMBER_STATEMENT",
    format: "PDF",
    period_label: "June 2026",
    generated_at: daysAgo(5),
    generated_by: "Ifeoma Chukwu",
    scope: "MEMBER",
    member_id: 1,
  },
  {
    id: nextId++,
    report_type: "MEMBER_STATEMENT",
    format: "PDF",
    period_label: "March 2026",
    generated_at: daysAgo(90),
    generated_by: "Ifeoma Chukwu",
    scope: "MEMBER",
    member_id: 1,
  },
];

export function addReportJob(input: Omit<MockReportJob, "id">): MockReportJob {
  const job: MockReportJob = { id: nextId++, ...input };
  if (job.scope === "COOPERATIVE") reportJobs.unshift(job);
  else memberReportJobs.unshift(job);
  logAuditEntry({
    actorName: job.generated_by,
    actorRole: job.scope === "COOPERATIVE" ? "Full admin" : "Member",
    action: "REPORT_GENERATED",
    targetMemberId: job.member_id,
    previousValue: null,
    newValue: { report_type: job.report_type, format: job.format, period: job.period_label },
    reason: "",
  });
  return job;
}
