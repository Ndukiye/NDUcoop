import type { Paginated, ApprovalStatus } from "../../lib/types";
import { currentActorOffice } from "../../lib/actor";
import { delay } from "../../mocks/delay";
import {
  commodityTypes,
  commodityApplications,
  addCommodityApplication,
  decideCommodityApplication,
  updateCommodityType,
  addCommodityType,
  type MockCommodityType,
  type MockCommodityApplication,
} from "../../mocks/commodities";
import { findMember } from "../../mocks/members";
import {
  repaymentRequests,
  addRepaymentRequest,
  decideRepaymentRequest,
  repaymentRequestsForTarget,
} from "../../mocks/repayments";
import type { EnrichedRepaymentRequest } from "../shared/RepaymentRequestsQueue";

export const CURRENT_MEMBER_ID = 1;

export interface CommodityApplication extends MockCommodityApplication {
  member_name: string;
  commodity_name: string;
}

function enrich(a: MockCommodityApplication): CommodityApplication {
  const m = findMember(a.member_id);
  const t = commodityTypes.find((ct) => ct.id === a.commodity_type_id);
  return {
    ...a,
    member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
    commodity_name: t?.name ?? "Unknown item",
  };
}

export async function fetchCommodityTypes(): Promise<MockCommodityType[]> {
  return delay(commodityTypes.filter((t) => t.is_active));
}

export async function fetchAllCommodityTypes(): Promise<MockCommodityType[]> {
  return delay(commodityTypes);
}

export async function fetchCommodityApplications(params?: {
  status?: ApprovalStatus;
  memberId?: number;
}): Promise<Paginated<CommodityApplication>> {
  let filtered = commodityApplications;
  if (params?.status) filtered = filtered.filter((a) => a.status === params.status);
  if (params?.memberId) filtered = filtered.filter((a) => a.member_id === params.memberId);
  const results = filtered.map(enrich);
  return delay({ count: results.length, next: null, previous: null, results });
}

export async function applyForCommodity(input: {
  commodityTypeId: number;
  quantity: number;
  durationMonths: number;
}): Promise<CommodityApplication> {
  const app = addCommodityApplication(
    CURRENT_MEMBER_ID,
    input.commodityTypeId,
    input.quantity,
    input.durationMonths,
  );
  return delay(enrich(app));
}

export async function decideCommodity(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
): Promise<CommodityApplication | null> {
  const app = decideCommodityApplication(id, decision, note, currentActorOffice());
  return delay(app ? enrich(app) : null);
}

export async function submitCommodityRepaymentRequest(input: {
  applicationId: number;
  amount: string;
  note: string;
  receiptFilename: string;
}): Promise<void> {
  addRepaymentRequest({
    targetType: "COMMODITY",
    targetId: input.applicationId,
    memberId: CURRENT_MEMBER_ID,
    amount: input.amount,
    receiptFilename: input.receiptFilename,
    note: input.note,
  });
  return delay(undefined);
}

function enrichRepayment(r: (typeof repaymentRequests)[number]): EnrichedRepaymentRequest {
  const m = findMember(r.member_id);
  return {
    id: r.id,
    member_name: m ? `${m.first_name} ${m.last_name}` : "Unknown member",
    amount: r.amount,
    receipt_filename: r.receipt_filename,
    note: r.note,
    status: r.status,
    submitted_at: r.submitted_at,
    decided_at: r.decided_at,
    decided_by: r.decided_by,
    decision_note: r.decision_note,
  };
}

export async function fetchCommodityRepaymentRequestsForApplication(
  applicationId: number,
): Promise<EnrichedRepaymentRequest[]> {
  return delay(repaymentRequestsForTarget("COMMODITY", applicationId).map(enrichRepayment));
}

export async function fetchCommodityRepaymentQueue(): Promise<EnrichedRepaymentRequest[]> {
  return delay(repaymentRequests.filter((r) => r.target_type === "COMMODITY").map(enrichRepayment));
}

export async function decideCommodityRepaymentRequest(
  id: number,
  decision: "APPROVE" | "REJECT",
  note: string,
): Promise<void> {
  decideRepaymentRequest(id, decision, note, currentActorOffice());
  return delay(undefined);
}

export async function saveCommodityType(
  id: number,
  updates: Partial<
    Pick<
      MockCommodityType,
      "cost_price" | "selling_price" | "current_stock_quantity" | "default_max_duration_months"
    >
  >,
): Promise<MockCommodityType | null> {
  const t = updateCommodityType(id, updates);
  return delay(t ?? null);
}

export async function createCommodityType(input: {
  name: string;
  unit: string;
  cost_price: string;
  selling_price: string;
  current_stock_quantity: number;
  default_max_duration_months: number;
}): Promise<MockCommodityType> {
  return delay(addCommodityType(input));
}
