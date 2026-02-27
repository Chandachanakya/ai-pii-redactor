import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Upload, History, BarChart3,
  ChevronLeft, ChevronRight,
  ShieldCheck, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Upload & Redact", icon: Upload, path: "/upload" },
  { label: "History", icon: History, path: "/history" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
];

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <aside
      className={cn(
        "flex flex-col h-full transition-all duration-300 ease-in-out border-r border-border/50",
        "bg-sidebar",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
        collapsed && "justify-center px-0"
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-glow">
          <ShieldCheck className="w-4.5 h-4.5 text-primary-foreground" size={18} />
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-bold text-foreground leading-none">SecureAI</div>
            <div className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wider uppercase">PII Redactor</div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">Main</span>
          </div>
        )}
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                collapsed && "justify-center px-2",
                active
                  ? "bg-primary/12 text-primary border-l-2 border-primary rounded-l-none"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                size={18}
                className={cn("flex-shrink-0 transition-colors", active ? "text-primary" : "group-hover:text-foreground")}
              />
              {!collapsed && (
                <span className={cn("text-sm font-medium", active && "text-primary")}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Status */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 rounded-lg bg-primary/8 border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={13} className="text-primary" />
            <span className="text-xs font-semibold text-primary">AI Engine</span>
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          </div>
          <div className="text-[11px] text-muted-foreground">spaCy NLP + Regex</div>
          <div className="text-[11px] text-muted-foreground">en_core_web_sm · v3.7</div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
