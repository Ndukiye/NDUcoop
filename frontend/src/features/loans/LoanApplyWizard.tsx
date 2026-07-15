import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stepper } from "../../components/Stepper";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Select } from "../../components/Select";
import { TextField } from "../../components/TextField";
import { Avatar } from "../../components/Avatar";
import { Icon } from "../../components/Icon";
import { useToast } from "../../components/Toast";
import { formatNaira } from "../../lib/format";
import {
  fetchLoanProducts,
  fetchMyLoans,
  fetchLoan,
  applyForLoan,
  submitTopUp,
  previewLoanBreakdown,
  lookupGuarantorByMembershipId,
  OPEN_LOAN_STATUSES,
} from "./api";

const steps = ["Product & amount", "Guarantors", "Review & submit"];

export function LoanApplyWizard() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const state = location.state as { productId?: number; topUpOfLoanId?: number } | null;
  const initialProductId = state?.productId;
  const topUpOfLoanId = state?.topUpOfLoanId;

  const [step, setStep] = useState(0);
  const [productId, setProductId] = useState<number | undefined>(initialProductId);
  const [principal, setPrincipal] = useState(50000);
  const [guarantorIdInputs, setGuarantorIdInputs] = useState<[string, string]>(["", ""]);

  const { data: products } = useQuery({
    queryKey: ["loans", "products"],
    queryFn: fetchLoanProducts,
  });
  const { data: myLoans } = useQuery({ queryKey: ["loans", "mine"], queryFn: fetchMyLoans });
  const openLoan = myLoans?.find((l) => OPEN_LOAN_STATUSES.includes(l.status));

  const { data: originalLoan } = useQuery({
    queryKey: ["loans", topUpOfLoanId],
    queryFn: () => fetchLoan(topUpOfLoanId!),
    enabled: !!topUpOfLoanId,
  });

  useEffect(() => {
    if (originalLoan && !initialProductId) {
      setProductId(originalLoan.loan_product_id);
      setPrincipal(Math.ceil((Number(originalLoan.outstanding_balance) + 10000) / 1000) * 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalLoan]);

  useEffect(() => {
    if (openLoan && openLoan.id !== topUpOfLoanId) {
      toast.show({
        tone: "info",
        title: "You already have a loan in progress",
        description: "Top up your existing loan instead of starting a new application.",
      });
      navigate(`/loans/${openLoan.id}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openLoan, topUpOfLoanId]);

  const breakdown = productId ? previewLoanBreakdown(productId, principal) : null;
  const outstandingToClear = originalLoan ? Number(originalLoan.outstanding_balance) : 0;
  const finalDisbursed = breakdown ? breakdown.amountDisbursed - outstandingToClear : 0;
  const belowTopUpMin = !!originalLoan && principal <= outstandingToClear;

  const applyMutation = useMutation({
    mutationFn: applyForLoan,
    onSuccess: (loan) => {
      toast.show({
        tone: "success",
        title: "Loan application submitted",
        description: "Your guarantors will be notified to accept.",
      });
      navigate(`/loans/${loan.id}`);
    },
  });

  const topUpMutation = useMutation({
    mutationFn: (input: { productId: number; principal: number; guarantorIds: number[] }) =>
      submitTopUp(topUpOfLoanId!, input.productId, input.principal, input.guarantorIds),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.show({ tone: "error", title: "Couldn't submit top-up", description: result.error });
        return;
      }
      toast.show({
        tone: "success",
        title: "Top-up submitted",
        description: "Your guarantors will need to accept the new loan.",
      });
      navigate(`/loans/${result.id}`);
    },
  });

  const mutation = topUpOfLoanId ? topUpMutation : applyMutation;

  const lookups = guarantorIdInputs.map((id) => lookupGuarantorByMembershipId(id));
  const resolvedGuarantors = lookups
    .map((l) => l.member)
    .filter((m): m is NonNullable<typeof m> => !!m);
  const isDuplicate =
    !!resolvedGuarantors[0] && !!resolvedGuarantors[1] && resolvedGuarantors[0].id === resolvedGuarantors[1].id;
  const guarantorsValid = resolvedGuarantors.length === 2 && !isDuplicate;
  const guarantorIds = guarantorsValid ? resolvedGuarantors.map((g) => g.id) : [];

  const selectedProduct = products?.find((p) => p.id === productId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-medium text-sand-900 dark:text-sand-50">
          {topUpOfLoanId ? "Top up your loan" : "Apply for a loan"}
        </h2>
        <p className="text-sm text-sand-500 dark:text-sand-400">
          {topUpOfLoanId
            ? "A top-up is a new loan application that clears your current loan's balance out of its proceeds — it goes through the same guarantor and admin approval steps."
            : "Complete all three steps to submit your application."}
        </p>
      </div>

      <Stepper steps={steps} currentStep={step} />

      <Card className="p-6">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {topUpOfLoanId && originalLoan && (
              <p className="text-sm text-sand-600 dark:text-sand-300">
                Your new loan amount must be greater than your current outstanding balance of{" "}
                <strong className="font-semibold">{formatNaira(originalLoan.outstanding_balance)}</strong>.
              </p>
            )}
            <Select
              label="Loan product"
              options={(products ?? []).map((p) => ({
                value: String(p.id),
                label: `${p.name} — ${p.duration_months} months @ ${p.interest_rate}%`,
              }))}
              value={productId ? String(productId) : ""}
              onChange={(e) => setProductId(Number(e.target.value))}
            />
            <TextField
              label="Amount requested (₦)"
              type="number"
              min={topUpOfLoanId ? outstandingToClear + 1 : 5000}
              step="1000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              error={belowTopUpMin ? "Must be greater than your outstanding balance." : undefined}
            />
            {breakdown && (
              <div className="rounded-lg border border-sand-200 bg-sand-50 p-4 text-sm dark:border-sand-700 dark:bg-sand-800">
                {breakdown.isOverride && (
                  <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2.5 text-gold-800 dark:border-gold-800/50 dark:bg-gold-900/20 dark:text-gold-200">
                    <Icon name="alert-triangle" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      This amount is over 3&times; your total assets, so a 9% high-risk interest
                      rate applies instead of the standard rate.
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sand-500 dark:text-sand-400">Interest rate</span>
                  <span className="font-medium">{breakdown.rate}%</span>
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="text-sand-500 dark:text-sand-400">Interest amount</span>
                  <span className="font-medium">{formatNaira(breakdown.interestAmount)}</span>
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="text-sand-500 dark:text-sand-400">Application fee</span>
                  <span className="font-medium">{formatNaira(breakdown.feeAmount)}</span>
                </div>
                {topUpOfLoanId && originalLoan && (
                  <div className="mt-1.5 flex justify-between">
                    <span className="text-sand-500 dark:text-sand-400">Old loan balance cleared</span>
                    <span className="font-medium">-{formatNaira(outstandingToClear)}</span>
                  </div>
                )}
                <div className="mt-1.5 flex justify-between border-t border-sand-200 pt-1.5 dark:border-sand-700">
                  <span className="text-sand-500 dark:text-sand-400">
                    {topUpOfLoanId ? "Amount disbursed to you" : "Amount disbursed"}
                  </span>
                  <span className="font-semibold">
                    {formatNaira(topUpOfLoanId ? Math.max(0, finalDisbursed) : breakdown.amountDisbursed)}
                  </span>
                </div>
                <div className="mt-1.5 flex justify-between">
                  <span className="text-sand-500 dark:text-sand-400">Monthly repayment</span>
                  <span className="font-medium">{formatNaira(breakdown.monthlyRepayment)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-sand-500 dark:text-sand-400">
              Enter the membership ID for each of your two guarantors. We'll look up their name for
              you to confirm.
            </p>
            {[0, 1].map((i) => {
              const lookup = lookups[i];
              const duplicateHere = isDuplicate && !!lookup.member;
              return (
                <div key={i} className="flex flex-col gap-2">
                  <TextField
                    label={`Guarantor ${i + 1} membership ID`}
                    placeholder="e.g. NDU-0007"
                    value={guarantorIdInputs[i]}
                    onChange={(e) =>
                      setGuarantorIdInputs((prev) => {
                        const next = [...prev] as [string, string];
                        next[i] = e.target.value;
                        return next;
                      })
                    }
                    error={
                      lookup.error ??
                      (duplicateHere ? "This member is already entered as the other guarantor." : undefined)
                    }
                  />
                  {lookup.member && !duplicateHere && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-pine-200 bg-pine-50 px-3 py-2 dark:border-pine-800 dark:bg-pine-950/30">
                      <Avatar
                        firstName={lookup.member.first_name}
                        lastName={lookup.member.last_name}
                        size="sm"
                      />
                      <div className="text-sm">
                        <p className="font-medium text-pine-800 dark:text-pine-200">
                          {lookup.member.first_name} {lookup.member.last_name}
                        </p>
                        <p className="text-xs text-pine-600 dark:text-pine-400">
                          {lookup.member.department_unit}
                        </p>
                      </div>
                      <Icon name="check" className="ml-auto h-4 w-4 text-pine-600 dark:text-pine-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && breakdown && selectedProduct && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Product</span>
              <span className="font-medium">{selectedProduct.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Amount requested</span>
              <span className="font-medium">{formatNaira(principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Interest rate</span>
              <span className="font-medium">
                {breakdown.rate}%{breakdown.isOverride && " (high-risk override)"}
              </span>
            </div>
            {topUpOfLoanId && originalLoan && (
              <div className="flex justify-between">
                <span className="text-sand-500 dark:text-sand-400">Old loan balance cleared</span>
                <span className="font-medium">-{formatNaira(outstandingToClear)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Amount disbursed</span>
              <span className="font-medium">
                {formatNaira(topUpOfLoanId ? Math.max(0, finalDisbursed) : breakdown.amountDisbursed)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Monthly repayment</span>
              <span className="font-medium">{formatNaira(breakdown.monthlyRepayment)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500 dark:text-sand-400">Guarantors</span>
              <span className="font-medium">
                {resolvedGuarantors.map((g) => g.first_name).join(", ")}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button
            variant="secondary"
            onClick={() =>
              step === 0
                ? navigate(topUpOfLoanId ? `/loans/${topUpOfLoanId}` : "/loans")
                : setStep((s) => s - 1)
            }
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < 2 ? (
            <Button
              disabled={
                (step === 0 && (!productId || principal <= 0 || belowTopUpMin)) ||
                (step === 1 && !guarantorsValid)
              }
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              loading={mutation.isPending}
              onClick={() =>
                productId &&
                (topUpOfLoanId
                  ? topUpMutation.mutate({ productId, principal, guarantorIds })
                  : applyMutation.mutate({ productId, principal, guarantorIds }))
              }
            >
              {topUpOfLoanId ? "Submit top-up" : "Submit application"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
