import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, LogOut, Sun, Moon, Menu, X, Mic } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';
import { Button } from './ui/Button';
import { useVoiceCommand } from '../hooks/useVoiceCommand';

export const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Temp bypass for dev

  const handleVoiceCommand = (text: string) => {
    alert(`Voice Command Recognized: "${text}"\n\n(Integration logic to match routes/api goes here)`);
  };

  const { isListening, startListening } = useVoiceCommand(handleVoiceCommand);

  useEffect(() => {
    authService.isAuthenticated().then(auth => {
      // setIsAuthenticated(auth);
      // if (!auth) {
      //  navigate('/login');
      //}
    });
  }, [navigate]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsMobileOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-between px-4 mb-6">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <CalendarCheck className="w-6 h-6" />
              <span>Attendify</span>
            </h1>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-3">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-card border-b border-border z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-medium">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                className={isListening ? "border-rose-500 text-rose-500 animate-pulse" : ""} 
                onClick={startListening}
            >
              <Mic className="w-4 h-4 mr-2" />
              {isListening ? "Listening..." : "Voice Command"}
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold ml-2">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
