"use client";

import dynamic from "next/dynamic";
import type { RefObject } from "react";
import { prefersReducedMotion, supportsWebGL } from "@/frontend/lib/motion";
import { useMounted } from "@/frontend/lib/use-mounted";
import type { HeroMotionState } from "./hero-motion";

const PhoneScene = dynamic(() => import("./PhoneScene"), {
  ssr: false,
  loading: () => <Fallback />,
});

function Fallback() {
  return (
    <div className="h-full w-full rounded-lg bg-linear-to-br from-ink/20 to-paper-2/30" />
  );
}

export function PhoneSceneLoader({
  className,
  motion,
}: {
  className?: string;
  motion?: RefObject<HeroMotionState>;
}) {
  const mounted = useMounted();
  const canRender3D = mounted && !prefersReducedMotion() && supportsWebGL();

  return <div className={className}>{canRender3D ? <PhoneScene motion={motion} /> : <Fallback />}</div>;
}
