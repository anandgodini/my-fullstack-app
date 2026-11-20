"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldCheck,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/src/lib/validations/auth";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessUser, setLoginSuccessUser] = useState<{
    name?: string | null;
    email: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setLoginSuccessUser(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.message || "Failed to log in", {
          description: result.errors
            ? Object.values(result.errors).flat().join(", ")
            : "Please check your credentials and try again.",
        });
        return;
      }

      toast.success("Authentication Successful!", {
        description: `Welcome back, ${result.user?.name || result.user?.email}`,
      });

      setLoginSuccessUser(result.user);
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1000);
    } catch (err: any) {
      console.error("Login submission error:", err);
      toast.error("Network error", {
        description: "Could not connect to the authentication server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Brand / Logo Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-600 mb-4 ring-1 ring-indigo-600/20 shadow-sm">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-950/5 ring-1 ring-zinc-200 dark:ring-zinc-800 rounded-2xl p-8 backdrop-blur-xl">
        {loginSuccessUser ? (
          <div className="py-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Logged in successfully!
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Authenticated as <span className="font-medium text-zinc-900 dark:text-zinc-200">{loginSuccessUser.email}</span>
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                <Database className="w-3.5 h-3.5" />
                <span>PostgreSQL 18 Connected via Prisma 7</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLoginSuccessUser(null)}
              className="mt-4 inline-flex items-center justify-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Sign in with another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  {...register("email")}
                  className={`block w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-zinc-850 ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400/20"
                      : "border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 focus:ring-indigo-600/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Password Reset", {
                      description: "Contact your administrator or reset via database.",
                    });
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  {...register("password")}
                  className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-zinc-850 ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-400/20"
                      : "border-zinc-200 dark:border-zinc-700 focus:border-indigo-600 focus:ring-indigo-600/20"
                  }`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={isLoading}
                  {...register("rememberMe")}
                  className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500/30 dark:border-zinc-700 dark:bg-zinc-800 cursor-pointer"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Database Status Indicator footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-500 inline-flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Connected to PostgreSQL 18 with Prisma 7
        </p>
      </div>
    </div>
  );
}
