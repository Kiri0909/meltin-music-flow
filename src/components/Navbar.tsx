
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Search, 
  Heart, 
  Settings, 
  Menu, 
  X, 
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Home", icon: <Home size={20} />, path: "/" },
    { label: "Search", icon: <Search size={20} />, path: "/search" },
    { label: "Favorites", icon: <Heart size={20} />, path: "/favorites" },
    { label: "Settings", icon: <Settings size={20} />, path: "/settings" },
  ];

  const renderMenuItems = (mobile: boolean = false) => (
    menuItems.map((item) => (
      <li key={item.label}>
        <Link 
          to={item.path}
          className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-200
            ${mobile ? 'hover:bg-white/10 text-lg' : 'hover:bg-white/10'}
          `}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
        >
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </li>
    ))
  );

  return (
    <header className="w-full animate-fade-in">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-meltin animate-gradient-shift">
            MeltIn
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-4">
          {renderMenuItems()}
        </ul>

        {/* User Controls */}
        <div className="hidden md:flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">ID: {user?.id}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout}
              className="rounded-full hover:bg-red-500/20 hover:text-red-500"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass-card w-[300px] border-none">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-meltin">MeltIn</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} />
                </Button>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-10 h-10 rounded-full bg-meltin-purple/30 flex items-center justify-center">
                  <span className="font-bold">{user?.id?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <p className="font-medium">User ID: {user?.id}</p>
                  <p className="text-xs text-gray-400">Logged in</p>
                </div>
              </div>

              <ul className="space-y-2 mb-auto">
                {renderMenuItems(true)}
              </ul>

              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between px-2">
                  <span>Theme</span>
                  <Button variant="ghost" size="sm" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                      <div className="flex items-center gap-2">
                        <Sun size={16} />
                        <span>Light Mode</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Moon size={16} />
                        <span>Dark Mode</span>
                      </div>
                    )}
                  </Button>
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Navbar;
