"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, X } from "lucide-react";

export default function LogoutButton() {
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleLogout = () => {
        signOut({ callbackUrl: "/login" });
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
            >
                <LogOut className="h-5 w-5" />
                Log out
            </button>

            {showModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                        aria-hidden="true"
                    />
                    <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:border dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold leading-6 text-slate-900 dark:text-white">
                                Confirm Logout
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-2 mb-6">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Are you sure you want to log out of your
                                account? You will need to sign in again to
                                access your financial dashboard.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end mt-4">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="inline-flex flex-1 justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="inline-flex flex-1 justify-center rounded-lg border border-transparent bg-red-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors dark:hover:bg-red-500 dark:focus:ring-offset-slate-900 cursor-pointer"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
