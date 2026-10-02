import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Button } from '../ui/Button';

export function TopHeader() {
  const { user, logout } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Clients', path: '/clients' },
    { name: 'Documents', path: '/documents' },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Automation', path: '/automation' },
  ];

  if (!user) return null;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8 shadow-sm">
      <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-primary">LeadFlow</span>
          <nav className="hidden md:flex gap-2">
            {navItems.map(item => (
                <NavLink key={item.name} to={item.path} className={({isActive}) => `px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${isActive ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                    {item.name}
                </NavLink>
            ))}
          </nav>
      </div>
      <div className="flex items-center gap-4 ml-auto">
        <span className="text-sm font-medium text-foreground">{user?.name}</span>
        <Button variant="destructive" onClick={logout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
