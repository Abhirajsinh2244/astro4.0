import React from 'react';
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Receipt, Wallet, PiggyBank, Bell, User } from "lucide-react";

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: PiggyBank },
];

const TopNav = () => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SpendWise</span>
          </a>
          
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a key={item.name} href={item.href}>
                <Button 
                  variant={currentPath === item.href ? "secondary" : "ghost"}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-background" />
          </Button>
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition-colors">
            <User className="h-5 w-5 text-slate-600" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;