import { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const isAuthPage = location === "/login" || location === "/register";

  return (
    <div className="min-h-[100dvh] w-full bg-watery flex justify-center overflow-hidden">
      <div className="w-full max-w-[430px] relative flex flex-col h-[100dvh] shadow-2xl bg-white/10">
        <div className="flex-1 overflow-y-auto pb-[90px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        {!isAuthPage && <BottomNav />}
      </div>
    </div>
  );
}
