"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import ConfirmModal from "../ui/ConfirmModal";

export default function LogoutButton() {
    const t = useTranslations("Logout");
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
                {t("button")}
            </button>

            <ConfirmModal
                isOpen={showModal}
                title={t("title")}
                message={t("message")}
                confirmText={t("confirm")}
                onConfirm={handleLogout}
                onCancel={() => setShowModal(false)}
                isDestructive
            />
        </>
    );
}
