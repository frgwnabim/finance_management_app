import {
  Baby,
  Banknote,
  BookOpen,
  Briefcase,
  Bus,
  Car,
  CirclePlus,
  Clapperboard,
  Coffee,
  Dumbbell,
  Ellipsis,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  HandCoins,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Pill,
  Plane,
  Receipt,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tag,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { CategoryIconName } from "@/lib/categories";
import { cn } from "@/lib/utils";

export const CATEGORY_ICON_COMPONENTS: Record<CategoryIconName, LucideIcon> = {
  briefcase: Briefcase,
  laptop: Laptop,
  gift: Gift,
  "circle-plus": CirclePlus,
  banknote: Banknote,
  "hand-coins": HandCoins,
  "trending-up": TrendingUp,
  landmark: Landmark,
  "piggy-bank": PiggyBank,
  wallet: Wallet,
  utensils: Utensils,
  coffee: Coffee,
  "shopping-cart": ShoppingCart,
  "shopping-bag": ShoppingBag,
  car: Car,
  fuel: Fuel,
  bus: Bus,
  plane: Plane,
  house: House,
  zap: Zap,
  wifi: Wifi,
  smartphone: Smartphone,
  receipt: Receipt,
  clapperboard: Clapperboard,
  "gamepad-2": Gamepad2,
  music: Music,
  "heart-pulse": HeartPulse,
  pill: Pill,
  "graduation-cap": GraduationCap,
  "book-open": BookOpen,
  shirt: Shirt,
  baby: Baby,
  "paw-print": PawPrint,
  dumbbell: Dumbbell,
  sparkles: Sparkles,
  ellipsis: Ellipsis,
};

const sizes = {
  xs: { box: "size-6", icon: "size-3.5" },
  sm: { box: "size-8", icon: "size-4" },
  md: { box: "size-10", icon: "size-5" },
} as const;

type CategoryIconProps = {
  icon: string;
  color: string;
  size?: keyof typeof sizes;
  className?: string;
};

/** Colored circle with the category's icon. Unknown icon names fall back to a tag. */
export function CategoryIcon({ icon, color, size = "md", className }: CategoryIconProps) {
  const Icon = CATEGORY_ICON_COMPONENTS[icon as CategoryIconName] ?? Tag;

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-white",
        sizes[size].box,
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <Icon className={sizes[size].icon} />
    </span>
  );
}
