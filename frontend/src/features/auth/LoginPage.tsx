import { type FormEvent, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Logo } from "../../components/Logo";
import { useAuthStore } from "../../store/auth";
import { login } from "./api";

export function LoginPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { email: string; password: string }) => login(vars.email, vars.password),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "me"], user);
      setUser(user);
      navigate("/", { replace: true });
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Read straight from the DOM (via FormData) rather than React state:
    // browser/password-manager autofill sets input.value without firing
    // React's onChange, which would otherwise submit stale empty state.
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    mutation.mutate({ email, password });
  }

  const errorMessage = mutation.isError
    ? axios.isAxiosError(mutation.error) && mutation.error.response?.status === 400
      ? "Invalid email or password. Please try again."
      : "Something went wrong while signing in. Please try again."
    : null;

  return (
    <div className="flex min-h-svh flex-col lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-pine-900 px-12 py-16 text-pine-50 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, var(--color-gold-300) 0, transparent 40%), radial-gradient(circle at 85% 75%, var(--color-pine-300) 0, transparent 45%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-pine-700/60"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full border border-gold-400/20"
        />

        <Logo mark size="lg" className="relative" />

        <div className="relative max-w-md">
          <p className="font-display text-4xl font-medium italic leading-tight text-pine-50">
            "Every contribution, every loan, every naira &mdash; accounted for."
          </p>
          <p className="mt-6 text-sm text-pine-200">
            Member savings, loans, and commodities, managed with a full audit
            trail your cooperative can trust.
          </p>
        </div>

        <p className="relative text-xs text-pine-300">
          &copy; {new Date().getFullYear()} NDU Staff Consumer Cooperative Society Ltd
        </p>
      </div>

      {/* Form panel. On mobile this is the whole scene: a full-height pine
          gradient backdrop (same ring/radial vocabulary as the desktop brand
          panel) with the form floating in a card. On lg it reverts to the
          plain sand column beside the brand panel. */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-pine-950 lg:items-center lg:justify-center lg:overflow-visible lg:bg-sand-25 lg:px-6 lg:py-16 lg:dark:bg-sand-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-pine-800 via-pine-900 to-pine-950 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18] lg:hidden"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 8%, var(--color-gold-300) 0, transparent 42%), radial-gradient(circle at 10% 90%, var(--color-pine-300) 0, transparent 45%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-gold-400/25 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-28 h-64 w-64 rounded-full border border-pine-600/50 lg:hidden"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full border border-pine-600/40 lg:hidden"
        />

        <div className="relative flex flex-1 flex-col justify-center px-5 py-10 lg:flex-none lg:p-0">
          <div className="mx-auto mb-7 w-full max-w-sm lg:hidden">
            <Logo size="lg" className="[&_span]:text-pine-50" />
          </div>

          <div className="mx-auto w-full max-w-sm rounded-3xl bg-sand-25 p-6 shadow-lifted ring-1 ring-white/10 dark:bg-sand-900 sm:p-7 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none lg:ring-0 lg:dark:bg-transparent">
            <h1 className="font-display text-2xl font-semibold text-sand-900 dark:text-sand-50">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-sand-500 dark:text-sand-400">
              Sign in with the email and password your administrator gave you.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <TextField
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue=""
              />
              <TextField
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                defaultValue=""
              />

              {errorMessage && (
                <div className="rounded-lg bg-brick-50 px-3.5 py-2.5 text-sm text-brick-700">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full"
                loading={mutation.isPending}
              >
                Sign in
              </Button>
            </form>

            <p className="mt-8 text-center text-xs text-sand-400">
              New members are onboarded by a cooperative admin &mdash; there is
              no public sign-up.
            </p>
          </div>

          <div className="mx-auto mt-9 w-full max-w-sm text-center lg:hidden">
            <p className="text-sm text-pine-300/90">Savings &middot; Loans &middot; Commodities</p>
            <p className="mt-2 text-xs text-pine-400/80">
              &copy; {new Date().getFullYear()} NDU Staff Consumer Cooperative Society Ltd
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
