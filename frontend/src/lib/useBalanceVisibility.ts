import { useEffect, useState } from "react";

const STORAGE_KEY = "ndu:balances-hidden";

export function useBalanceVisibility() {
  const [hidden, setHidden] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, hidden ? "1" : "0");
  }, [hidden]);

  return [hidden, setHidden] as const;
}

export const MASKED_VALUE = "₦ ••••••";
