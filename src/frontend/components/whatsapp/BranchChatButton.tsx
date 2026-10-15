"use client";

import type { ReactNode } from "react";
import { useStoreChat } from "@/frontend/store/store-chat-store";
import type { Branch } from "@/shared/branches";
import { branchWhatsAppLink } from "@/shared/whatsapp";

/**
 * WhatsApp link to one specific branch (on a store card). Tapping it also
 * makes that branch the visitor's store for every other WhatsApp button.
 * Renders nothing for a branch without a number.
 */
export function BranchChatButton({
  branch,
  className,
  children,
}: {
  branch: Branch;
  className?: string;
  children: ReactNode;
}) {
  const choose = useStoreChat((s) => s.choose);
  if (!branch.phone) return null;
  return (
    <a
      href={branchWhatsAppLink(branch)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => choose(branch.slug)}
      aria-label={`Chat with the ${branch.name} store on WhatsApp`}
      className={className}
    >
      {children}
    </a>
  );
}
