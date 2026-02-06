import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { motion } from "framer-motion";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useCompactView } from "@/hooks/useCompactView";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { collapsed } = useSidebarState();
  const { compactView } = useCompactView();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <motion.div
        initial={false}
        animate={{ paddingLeft: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <Header />
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={cn("p-6", compactView && "p-4 space-y-4 [&_.bg-card]:p-4 [&_h1]:text-2xl [&_h2]:text-lg [&_h3]:text-base")}
        >
          {children}
        </motion.main>
      </motion.div>
    </div>
  );
}
