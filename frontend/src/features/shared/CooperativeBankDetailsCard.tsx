import { Icon } from "../../components/Icon";
import { CopyButton } from "../../components/CopyButton";
import { findCooperativeAccount, type CooperativeAccountPurpose } from "../../mocks/cooperative";

export function CooperativeBankDetailsCard({ purpose }: { purpose: CooperativeAccountPurpose }) {
  const account = findCooperativeAccount(purpose);
  return (
    <div className="rounded-lg border border-pine-200 bg-pine-50 p-4 text-sm dark:border-pine-800 dark:bg-pine-950/30">
      <div className="mb-2 flex items-center gap-2 text-pine-700 dark:text-pine-300">
        <Icon name="wallet" className="h-4 w-4" />
        <span className="font-medium">Transfer to the cooperative's {account.label.toLowerCase()} account</span>
      </div>
      <dl className="grid grid-cols-1 gap-2 text-pine-800 dark:text-pine-200 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-pine-500 dark:text-pine-400">Bank</dt>
          <dd>{account.bank_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-pine-500 dark:text-pine-400">Account name</dt>
          <dd>{account.account_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-pine-500 dark:text-pine-400">Account number</dt>
          <dd className="flex items-center gap-1.5 font-medium">
            {account.account_number}
            <CopyButton value={account.account_number} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
