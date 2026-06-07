import { useAnalytics } from '@/hooks/useAnalytics';

export default function InsightsLoader() {
  useAnalytics(false, true);
  return null;
}
