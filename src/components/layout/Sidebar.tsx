import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { LayoutDashboard, BookOpen, ClipboardCheck, BarChart3, Settings, ChevronLeft, ChevronRight, Wallet, Bell } from "lucide-react";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarState } from "@/hooks/useSidebarState";
const navItems = [{
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/"
}, {
  icon: BookOpen,
  label: "Journal",
  path: "/journal"
}, {
  icon: ClipboardCheck,
  label: "My Strategy",
  path: "/checklist"
}, {
  icon: BarChart3,
  label: "Analytics",
  path: "/analytics"
}, {
  icon: Wallet,
  label: "Accounts",
  path: "/accounts"
}, {
  icon: Bell,
  label: "Alerts",
  path: "/alerts"
}, {
  icon: Settings,
  label: "Settings",
  path: "/settings"
}];
export function Sidebar() {
  const {
    collapsed,
    toggle
  } = useSidebarState();
  const location = useLocation();
  const {
    resolvedTheme
  } = useTheme();
  return <motion.aside initial={false} animate={{
    width: collapsed ? 80 : 260
  }} transition={{
    duration: 0.3,
    ease: "easeInOut"
  }} className="h-screen bg-sidebar border-r border-sidebar-border flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!collapsed && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="flex items-center">
              <img src={resolvedTheme === "dark" ? logoDark : logoLight} alt="PipTrace" className="h-8 object-contain" />
            </motion.div>}
        </AnimatePresence>
        
        {collapsed && <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow mx-auto">
            <img src={resolvedTheme === "dark" ? logoDark : logoLight} alt="PipTrace" className="h-6 object-contain" />
          </div>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return <Link key={item.path} to={item.path}>
              <motion.div whileHover={{
            scale: 1.02
          }} whileTap={{
            scale: 0.98
          }} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 shadow-none", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")}>
                <item.icon className="w-5 h-5 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && <motion.span initial={{
                opacity: 0,
                width: 0
              }} animate={{
                opacity: 1,
                width: "auto"
              }} exit={{
                opacity: 0,
                width: 0
              }} className="font-medium text-sm whitespace-nowrap overflow-hidden">
                      {item.label}
                    </motion.span>}
                </AnimatePresence>
              </motion.div>
            </Link>;
      })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <Button variant="ghost" size="sm" onClick={toggle} className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              <span className="text-sm">Collapse</span>
            </>}
        </Button>
      </div>
    </motion.aside>;
}