"use client";

import type { AnchorHTMLAttributes } from "react";
import { useStoreChatLink } from "@/frontend/store/store-chat-store";

/**
 * A WhatsApp chat link that goes to the visitor's nearest store. For server
 * components; client components can spread `useStoreChatLink()` instead.
 * `message` may contain `{store}` for the branch name.
 */
export function StoreChatLink({
  message,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick" | "target" | "rel"> & { message?: string }) {
  const link = useStoreChatLink(message);
  return <a {...props} {...link} />;
}
