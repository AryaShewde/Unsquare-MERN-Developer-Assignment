import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', roles: ['PLATFORM_ADMIN', 'BROKERAGE_ADMIN', 'ADVISOR'] },
  ];

  if (!user) return null;

  return (
    <>
      {/* Drawer overlay for mobile */}
      {isOpen && <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={onClose} />}
      
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-card border-r border-border transition-transform duration-200 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-bold text-primary">LeadFlow</span>
        </div>
        <nav className="mt-6 flex flex-col gap-1 px-4">
          {navItems.filter(item => item.roles.includes(user.role)).map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
              onClick={onClose}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
