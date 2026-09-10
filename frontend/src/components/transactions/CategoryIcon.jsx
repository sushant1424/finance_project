import {
  UtensilsCrossed, Car, Home, Tv, Heart, GraduationCap, ShoppingBag, Zap,
  Plane, Smile, TrendingUp, Briefcase, Laptop, Building2, MoreHorizontal, ArrowLeftRight, PiggyBank,
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { resolveCategory } from '@/utils/resolveCategory';
import { cn } from '@/lib/utils';

const ICON_MAP = {
  UtensilsCrossed, Car, Home, Tv, Heart, GraduationCap, ShoppingBag, Zap,
  Plane, Smile, TrendingUp, Briefcase, Laptop, Building2, MoreHorizontal, ArrowLeftRight, PiggyBank,
};

const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5' };
const boxSizes = { sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-10 w-10' };
const emojiSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

function isEmojiIcon(icon) {
  return Boolean(icon) && !ICON_MAP[icon];
}

export default function CategoryIcon({ categoryId, size = 'md', showBackground = true, className }) {
  const { custom } = useCategories();
  const category = resolveCategory(categoryId, custom);
  const color = category.color;
  const emoji = isEmojiIcon(category.icon);

  const glyph = emoji ? (
    <span className={cn(emojiSizes[size], 'leading-none')} aria-hidden>
      {category.icon || '📁'}
    </span>
  ) : (
    (() => {
      const Icon = ICON_MAP[category.icon] ?? MoreHorizontal;
      return <Icon className={sizes[size]} aria-hidden />;
    })()
  );

  if (!showBackground) {
    return (
      <span
        className={cn('inline-flex items-center justify-center', className)}
        style={emoji ? undefined : { color }}
        title={category.label}
      >
        {glyph}
      </span>
    );
  }

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center rounded-lg', boxSizes[size], className)}
      style={{ backgroundColor: `${color}20`, color }}
      title={category.label}
    >
      {glyph}
    </span>
  );
}
