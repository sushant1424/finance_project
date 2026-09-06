import {
  UtensilsCrossed, Car, Home, Tv, Heart, GraduationCap, ShoppingBag, Zap,
  Plane, Smile, TrendingUp, Briefcase, Laptop, Building2, MoreHorizontal, ArrowLeftRight, PiggyBank,
} from 'lucide-react';
import { getCategoryById } from '@/constants/categories';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  UtensilsCrossed, Car, Home, Tv, Heart, GraduationCap, ShoppingBag, Zap,
  Plane, Smile, TrendingUp, Briefcase, Laptop, Building2, MoreHorizontal, ArrowLeftRight, PiggyBank,
};

export default function CategoryIcon({ categoryId, size = 'md', showBackground = true, className }) {
  const category = getCategoryById(categoryId);
  const Icon = ICON_MAP[category?.icon] ?? MoreHorizontal;
  const color = category?.color ?? '#71717a';
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
  const boxSizes = { sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-10 w-10' };

  if (!showBackground) {
    return <Icon className={cn(sizes[size], className)} style={{ color }} aria-hidden />;
  }

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-lg', boxSizes[size], className)}
      style={{ backgroundColor: `${color}20`, color }}
      title={category?.label}
    >
      <Icon className={sizes[size]} aria-hidden />
    </span>
  );
}
