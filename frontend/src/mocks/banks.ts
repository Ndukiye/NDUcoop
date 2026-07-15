import { delay } from "./delay";

export interface NigerianBank {
  code: string;
  name: string;
}

// Standard CBN-licensed bank list, shaped like a real bank-lookup API
// response (e.g. Paystack/Flutterwave's /bank endpoint) so swapping this
// for a live call later is a body-swap, not a rewrite.
const NIGERIAN_BANKS: NigerianBank[] = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank (FCMB)" },
  { code: "058", name: "Guaranty Trust Bank (GTBank)" },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank for Africa (UBA)" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
  { code: "50211", name: "Kuda Bank" },
  { code: "999992", name: "Opay" },
  { code: "999991", name: "PalmPay" },
  { code: "120001", name: "9mobile 9Payment Service Bank" },
  { code: "120002", name: "Moniepoint MFB" },
];

export async function fetchNigerianBanks(): Promise<NigerianBank[]> {
  return delay(NIGERIAN_BANKS, 300);
}
