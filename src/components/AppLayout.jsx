import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, BookOpen, LogOut, Boxes, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/menu', label: 'Menu', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-border">
          <div className="grid place-items-center w-9 h-9 rounded-xl bg-brand text-white">
            <Boxes className="w-5 h-5" />
          </div>
          <span className="font-heading font-semibold text-lg tracking-tight">Stockpile</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          {user && (
            <div className="px-3 pb-2 text-sm font-medium truncate">
              {user.display_name || user.full_name || user.email}
            </div>
          )}
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 text-muted-foreground">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      <div className="md:pl-64">
        <main className="min-h-screen pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card flex">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                isActive ? 'text-brand' : 'text-muted-foreground'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}