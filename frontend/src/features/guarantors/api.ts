import { delay } from "../../mocks/delay";
import {
  guarantorRequestsForMember,
  respondToGuarantorRequest,
  type MockGuarantorRequest,
} from "../../mocks/guarantors";
import { findLoan } from "../../mocks/loans";
import { findMember } from "../../mocks/members";
import { loanProducts } from "../../mocks/loanProducts";

const CURRENT_MEMBER_ID = 1;

export interface GuarantorRequestWithDetail extends MockGuarantorRequest {
  applicant_name: string;
  product_name: string;
  principal: string;
}

function enrich(r: MockGuarantorRequest): GuarantorRequestWithDetail {
  const loan = findLoan(r.loan_id);
  const applicant = loan ? findMember(loan.member_id) : undefined;
  const product = loan ? loanProducts.find((p) => p.id === loan.loan_product_id) : undefined;
  return {
    ...r,
    applicant_name: applicant ? `${applicant.first_name} ${applicant.last_name}` : "Unknown member",
    product_name: product?.name ?? "Unknown product",
    principal: loan?.principal_granted ?? "0",
  };
}

export async function fetchMyGuarantorRequests(): Promise<GuarantorRequestWithDetail[]> {
  return delay(guarantorRequestsForMember(CURRENT_MEMBER_ID).map(enrich));
}

export async function respondToGuarantorRequestApi(
  id: number,
  accept: boolean,
): Promise<GuarantorRequestWithDetail | null> {
  const req = respondToGuarantorRequest(id, accept);
  return delay(req ? enrich(req) : null);
}
