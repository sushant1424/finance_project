import { getCategoryById } from '@/constants/categories';

export const FALLBACK_CATEGORY = {
  id: 'other',
  label: 'Other',
  icon: 'MoreHorizontal',
  color: '#71717a',
  kind: 'fallback',
};

/** Slug used when storing custom category names on transactions. */
export function categorySlug(name) {
  return String(name ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Resolve a category id/slug against built-ins + optional custom list.
 * Always returns a usable { id, label, icon, color, kind } — never blank.
 */
export function resolveCategory(idOrSlug, custom = []) {
  if (!idOrSlug) return { ...FALLBACK_CATEGORY };

  const builtin = getCategoryById(idOrSlug);
  if (builtin) return { ...builtin, kind: 'builtin' };

  const match = custom.find(
    (c) => c.id === idOrSlug || categorySlug(c.name) === idOrSlug,
  );
  if (match) {
    return {
      id: categorySlug(match.name) || match.id,
      label: match.name,
      icon: match.icon || '📁',
      color: match.color || FALLBACK_CATEGORY.color,
      kind: 'custom',
    };
  }

  return {
    id: idOrSlug,
    label: String(idOrSlug).replace(/_/g, ' '),
    icon: FALLBACK_CATEGORY.icon,
    color: FALLBACK_CATEGORY.color,
    kind: 'fallback',
  };
}

export default resolveCategory;
