import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { setTheme } from '@/store/uiSlice';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className, size = 'icon', children }) {
  const dispatch = useDispatch();
  const theme = useSelector((s) => s.ui.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme !== 'light');
  }, [theme]);

  const toggle = () => dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggle}
      className={cn('text-muted hover:text-foreground', className)}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {children}
    </Button>
  );
}
