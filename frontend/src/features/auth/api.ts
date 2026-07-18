import { delay } from "../../mocks/delay";
import type { CurrentUser } from "../../store/auth";

/**
 * Phase-1 prototype auth: fully mocked, like every other data source in this
 * build, so the frontend deploys as a self-contained static site (no Django
 * needed) for client feedback. The function signatures match the real
 * session-auth endpoints (/auth/me/, /auth/login/, /auth/logout/) — wiring
 * the backend later is a body swap. The demo accounts mirror the QA guide.
 */
const DEMO_ACCOUNTS: (CurrentUser & { password: string })[] = [
  {
    id: 1,
    email: "president@ndu-coop.example",
    password: "AdminPass123!",
    first_name: "Ineye",
    last_name: "Komonibo",
    role: "PRESIDENT",
  },
  {
    id: 2,
    email: "gensec@ndu-coop.example",
    password: "ReadOnly123!",
    first_name: "Oyinpreye",
    last_name: "Douglas",
    role: "GENERAL_SECRETARY",
  },
  {
    id: 3,
    email: "member1@example.com",
    password: "MemberPass123!",
    first_name: "Ebiere",
    last_name: "Owei",
    role: "MEMBER",
  },
];

const SESSION_KEY = "ndu:mock-session";

function toUser({ password: _password, ...user }: (typeof DEMO_ACCOUNTS)[number]): CurrentUser {
  return user;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) return delay(null, 200);
  const account = DEMO_ACCOUNTS.find((a) => a.email === stored);
  return delay(account ? toUser(account) : null, 200);
}

export async function login(email: string, password: string): Promise<CurrentUser> {
  await delay(undefined, 350);
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
  );
  if (!account) {
    // Same shape the real API rejects with, so LoginPage's axios-based
    // error handling shows "Invalid email or password".
    throw Object.assign(new Error("Invalid credentials"), {
      isAxiosError: true,
      response: { status: 400 },
    });
  }
  localStorage.setItem(SESSION_KEY, account.email);
  return toUser(account);
}

export async function logout(): Promise<void> {
  localStorage.removeItem(SESSION_KEY);
  return delay(undefined, 200);
}
