import Image from "next/image";

const VARIANTS = {
  // Full lockup (star mark + "amrit" + "Mobiles") — needs more vertical
  // room to stay legible. Use in footer, login screen.
  full: { src: "/logo.png", width: 1000, height: 651 },
  // Star mark + "amrit" only, cropped from the same source — for tight
  // spaces like the sticky header where "Mobiles" would be unreadable.
  compact: { src: "/logo-compact.png", width: 1000, height: 556 },
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
      alt="Amrit Mobiles"
      width={width}
      height={height}
      priority
      className={className}
    />
  );
}
