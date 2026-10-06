import { Stagger } from "@/frontend/components/motion/Stagger";
import { BoltIcon, CardIcon, PhoneIcon, TrophyIcon } from "@/frontend/components/shop/icons";
import { SectionHeader } from "./SectionHeader";
import { CategoryCard } from "./CategoryCard";
import { BatteryIcon, CameraIcon, SignalIcon } from "./icons";

type IconType = ({ className }: { className?: string }) => React.ReactNode;

const ICONS: Record<string, IconType> = {
  flagship: TrophyIcon,
  camera: CameraIcon,
  gaming: BoltIcon,
  budget: CardIcon,
  battery: BatteryIcon,
  compact: PhoneIcon,
  "5g": SignalIcon,
};

export type CategoryTile = {
  slug: string;
  name: string;
  image: string | null;
  count: number;
};

export function CategoryGrid({ categories }: { categories: CategoryTile[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 border-t border-line">
      <SectionHeader
        title="Shop by need"
        sub="Not sure of the model yet? Start from what the phone has to be good at."
      />
      <Stagger as="ul" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((c) => (
          <li key={c.slug}>
            <CategoryCard
              slug={c.slug}
              name={c.name}
              image={c.image}
              count={c.count}
              Icon={ICONS[c.slug] ?? PhoneIcon}
            />
          </li>
        ))}
      </Stagger>
    </section>
  );
}
