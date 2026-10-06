import Image from "next/image";

const VARIANTS = {
  // Full lockup (star mark + "amrit" + "Mobiles & Electronics") — needs
  // more vertical room to stay legible. Use in footer, login screen.
  full: { src: "/logo.png", width: 656, height: 390 },
  // Star mark + "amrit" only, cropped from the same source — for tight
  // spaces like the sticky header and admin sidebar where the full
  // three-line lockup would be squeezed unreadable.
  compact: { src: "/logo-compact.png", width: 525, height: 293 },
} as const;

export function BrandLogo({
  variant = "full",
  className = "h-9 w-auto",
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { src, width, height } = VARIANTS[variant];
  return (
    <Image
      src={src}
      alt="Amrit Mobiles & Electronics"
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}
