import { useAuth } from '../../auth/useAuth';
import { useTheme } from '../../auth/ThemeContext';
import { Button } from '../ui/Button';

export function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-8">
      <Button variant="ghost" className="md:hidden" onClick={onMenuClick}>
        Menu
      </Button>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm text-muted-foreground">{user?.name} ({user?.role})</span>
        <Button variant="outline" onClick={toggleTheme}>
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </Button>
        <Button variant="destructive" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
