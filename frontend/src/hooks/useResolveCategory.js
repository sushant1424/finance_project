import { useCallback } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { resolveCategory } from '@/utils/resolveCategory';

/** Resolve built-in or custom category meta (icon, color, label) with a safe fallback. */
export function useResolveCategory() {
  const { custom } = useCategories();
  return useCallback((idOrSlug) => resolveCategory(idOrSlug, custom), [custom]);
}

export default useResolveCategory;
