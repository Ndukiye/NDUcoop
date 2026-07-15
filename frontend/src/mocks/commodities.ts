import type { ApprovalStatus } from "../lib/types";
import { logAuditEntry } from "./audit";

export type CommodityApplicationStatus = ApprovalStatus | "COMPLETED";

export interface MockCommodityRepayment {
  id: string;
  amount: string;
  paid_at: string;
  is_manual: boolean;
}

export interface MockCommodityType {
  id: number;
  name: string;
  unit: string;
  cost_price: string;
  selling_price: string;
  current_stock_quantity: number;
  default_max_duration_months: number;
  is_active: boolean;
}

export const commodityTypes: MockCommodityType[] = [
  {
    id: 1,
    name: "Rice",
    unit: "50kg bag",
    cost_price: "45000.00",
    selling_price: "52000.00",
    current_stock_quantity: 120,
    default_max_duration_months: 6,
    is_active: true,
  },
  {
    id: 2,
    name: "Vegetable Oil",
    unit: "25L keg",
    cost_price: "38000.00",
    selling_price: "43500.00",
    current_stock_quantity: 60,
    default_max_duration_months: 6,
    is_active: true,
  },
  {
    id: 3,
    name: "Beans",
    unit: "50kg bag",
    cost_price: "40000.00",
    selling_price: "46000.00",
    current_stock_quantity: 8,
    default_max_duration_months: 6,
    is_active: true,
  },
  {
    id: 4,
    name: "Sugar",
    unit: "50kg bag",
    cost_price: "30000.00",
    selling_price: "35000.00",
    current_stock_quantity: 0,
    default_max_duration_months: 6,
    is_active: true,
  },
];

export interface MockCommodityApplication {
  id: number;
  member_id: number;
  commodity_type_id: number;
  quantity: number;
  duration_months: number;
  unit_price: string;
  total_amount: string;
  monthly_repayment: string;
  outstanding_balance: string;
  status: CommodityApplicationStatus;
  submitted_at: string;
  decided_at: string | null;
  decided_by: string | null;
  decision_note: string | null;
  repayments: MockCommodityRepayment[];
}

let nextId = 1;

function iso(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function makeApplication(
  memberId: number,
  typeId: number,
  quantity: number,
  duration: number,
  status: CommodityApplicationStatus,
  submittedDaysAgo: number,
  decidedBy: string | null,
  decisionNote: string | null,
): MockCommodityApplication {
  const type = commodityTypes.find((t) => t.id === typeId)!;
  const total = Number(type.selling_price) * quantity;
  return {
    id: nextId++,
    member_id: memberId,
    commodity_type_id: typeId,
    quantity,
    duration_months: duration,
    unit_price: type.selling_price,
    total_amount: total.toFixed(2),
    monthly_repayment: (total / duration).toFixed(2),
    outstanding_balance: total.toFixed(2),
    status,
    submitted_at: iso(submittedDaysAgo),
    decided_at: status === "PENDING" ? null : iso(submittedDaysAgo - 1),
    decided_by: decidedBy,
    decision_note: decisionNote,
    repayments: [],
  };
}

export const commodityApplications: MockCommodityApplication[] = [
  makeApplication(1, 1, 2, 6, "PENDING", 1, null, null),
  makeApplication(2, 2, 1, 4, "PENDING", 2, null, null),
  makeApplication(3, 1, 1, 6, "APPROVED", 20, "Amaka Okafor", null),
  makeApplication(4, 3, 3, 6, "APPROVED", 35, "Tunde Bakare", null),
  makeApplication(1, 4, 2, 3, "REJECTED", 15, "Amaka Okafor", "Item currently out of stock"),
  makeApplication(6, 2, 2, 6, "PENDING", 0.5, null, null),
];

// Give one approved application a bit of repayment history for a realistic demo.
const sampleRepaid = commodityApplications.find((a) => a.id === 3);
if (sampleRepaid) {
  const paid = Number(sampleRepaid.monthly_repayment) * 2;
  sampleRepaid.outstanding_balance = (Number(sampleRepaid.total_amount) - paid).toFixed(2);
  sampleRepaid.repayments = [
    { id: "seed-3-1", amount: sampleRepaid.monthly_repayment, paid_at: iso(10), is_manual: false },
    { id: "seed-3-2", amount: sampleRepaid.monthly_repayment, paid_at: iso(5), is_manual: true },
  ];
}

export function applyManualCommodityRepayment(
  applicationId: number,
  amount: number,
): MockCommodityApplication | undefined {
  const app = commodityApplications.find((a) => a.id === applicationId);
  if (!app) return undefined;
  const newOutstanding = Math.max(0, Number(app.outstanding_balance) - amount);
  app.outstanding_balance = newOutstanding.toFixed(2);
  app.repayments.unshift({
    id: `manual-${applicationId}-${Date.now()}`,
    amount: amount.toFixed(2),
    paid_at: new Date().toISOString(),
    is_manual: true,
  });
  if (newOutstanding <= 0) {
    app.status = "COMPLETED";
  }
  return app;
}

export function addCommodityApplication(
  memberId: number,
  commodityTypeId: number,
  quantity: number,
  durationMonths: number,
): MockCommodityApplication {
  const app = makeApplication(memberId, commodityTypeId, quantity, durationMonths, "PENDING", 0, null, null);
  commodityApplications.unshift(app);
  return app;
}

export function decideCommodityApplication(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
  decidedBy: string,
): MockCommodityApplication | undefined {
  const app = commodityApplications.find((a) => a.id === id);
  if (!app) return undefined;
  app.status = decision === "APPROVE" ? "APPROVED" : "REJECTED";
  app.decided_at = new Date().toISOString();
  app.decided_by = decidedBy;
  app.decision_note = note || null;
  if (decision === "APPROVE") {
    const type = commodityTypes.find((t) => t.id === app.commodity_type_id);
    if (type) {
      type.current_stock_quantity = Math.max(0, type.current_stock_quantity - app.quantity);
    }
  }
  logAuditEntry({
    actorName: decidedBy,
    actorRole: "Full admin",
    action: decision === "APPROVE" ? "COMMODITY_APPROVED" : "COMMODITY_REJECTED",
    targetMemberId: app.member_id,
    previousValue: { status: "PENDING" },
    newValue: { status: app.status, total_amount: app.total_amount },
    reason: note,
  });
  return app;
}

export function updateCommodityType(
  id: number,
  updates: Partial<
    Pick<
      MockCommodityType,
      "cost_price" | "selling_price" | "current_stock_quantity" | "default_max_duration_months"
    >
  >,
): MockCommodityType | undefined {
  const type = commodityTypes.find((t) => t.id === id);
  if (!type) return undefined;
  Object.assign(type, updates);
  return type;
}
