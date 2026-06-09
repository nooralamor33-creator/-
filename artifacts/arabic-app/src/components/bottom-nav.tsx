import { Link, useLocation } from "wouter";
import { User, Users, Grid, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/profile", label: "أنا", icon: User },
    { href: "/groups", label: "الغرف", icon: Users },
    { href: "/posts", label: "المنشورات", icon: Grid },
    { href: "/messages", label: "المحادثات", icon: MessageCircle },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-panel pb-safe pt-2 px-4 rounded-t-3xl max-w-[430px] mx-auto">
      <div className="flex justify-between items-center mb-2">
        {navItems.map((item) => {
          const isActive = location.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div
                className={cn(
                  "flex flex-col items-center justify-center space-y-1 py-1 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-2xl transition-all duration-300",
                    isActive ? "bg-primary/10 scale-110" : ""
                  )}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
