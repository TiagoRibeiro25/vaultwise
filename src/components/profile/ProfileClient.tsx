"use client";

import { useState, useEffect } from "react";
import { User, Mail, Lock, Save, AlertCircle, CheckCircle } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

interface ProfileData {
    id: string;
    name: string;
    email: string;
}

export default function ProfileClient() {
    const t = useTranslations("Profile");
    const {
        data: profile,
        execute: fetchProfile,
        isLoading,
    } = useApi<ProfileData>({
        url: "/api/profile",
    });

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { execute: updateProfile } = useApi({
        url: "/api/profile",
        method: "PUT",
    });

    useEffect(() => {
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (profile) {
            setName(profile.name);
            setEmail(profile.email);
        }
    }, [profile]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSuccessMessage("");
        setErrorMessage("");

        if (!name.trim() || !email.trim()) {
            setErrorMessage(t("nameRequired"));
            return;
        }

        if (password) {
            if (password !== confirmPassword) {
                setErrorMessage(t("passwordsNotMatch"));
                return;
            }
            if (password.length < 6) {
                setErrorMessage(t("passwordLength"));
                return;
            }
        }

        setIsSaving(true);

        const payload = {
            name,
            email,
            password: password || undefined,
        };

        const result = (await updateProfile(payload)) as {
            error?: string;
        } | null;

        if (result?.error) {
            setErrorMessage(result.error);
        } else {
            setSuccessMessage(t("updateSuccess"));
            setPassword("");
            setConfirmPassword("");

            // If email changed, we need to sign out because the NextAuth session is based on email
            if (profile && email !== profile.email) {
                setTimeout(() => {
                    signOut({
                        callbackUrl:
                            "/login?message=Email updated. Please log in again.",
                    });
                }, 2000);
            } else {
                fetchProfile();
            }
        }

        setIsSaving(false);
    };

    if (isLoading && !profile) {
        return (
            <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {t("title")}
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {t("subtitle")}
                </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {successMessage && (
                            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                                <CheckCircle className="h-5 w-5 shrink-0" />
                                <p>{successMessage}</p>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                                {t("personalInfo")}
                            </h3>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2">
                                    {t("fullName")}
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <User
                                            className="h-5 w-5 text-slate-400"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2">
                                    {t("emailAddress")}
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Mail
                                            className="h-5 w-5 text-slate-400"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    {t("emailChangeWarning")}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800">
                                {t("changePassword")}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t("leaveBlank")}
                            </p>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2">
                                    {t("newPassword")}
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock
                                            className="h-5 w-5 text-slate-400"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300 mb-2">
                                    {t("confirmPassword")}
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock
                                            className="h-5 w-5 text-slate-400"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-slate-950 dark:text-white dark:ring-slate-700 dark:focus:ring-indigo-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:w-auto dark:bg-indigo-500 dark:hover:bg-indigo-400 cursor-pointer"
                            >
                                {isSaving ? (
                                    t("saving")
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        {t("saveChanges")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
