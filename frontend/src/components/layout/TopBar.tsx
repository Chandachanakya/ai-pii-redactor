import { Bell, Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Overview & key metrics" },
  "/upload": { title: "Upload & Redact", description: "Analyze and redact PII from documents" },
  "/history": { title: "Redaction History", description: "All processed files and results" },
  "/analytics": { title: "Analytics", description: "Data insights and compliance reports" },
  "/admin": { title: "Admin Panel", description: "User management & system configuration" },
  "/settings": { title: "Settings", description: "Account and system preferences" },
};

export default function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const page = pageTitles[location.pathname] || { title: "SecureAI", description: "" };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-card/50 backdrop-blur-sm flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-foreground">{page.title}</h1>
        <p className="text-xs text-muted-foreground">{page.description}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-secondary/50 border border-border rounded-lg px-3 py-1.5 w-56">
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            placeholder="Search records..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell size={18} className="text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* GDPR Badge */}
        <Badge variant="outline" className="hidden lg:flex text-success border-success/30 bg-success/10 text-[11px]">
          GDPR Compliant
        </Badge>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-secondary transition-colors">
              <img src={user?.avatar} alt={user?.name} className="w-7 h-7 rounded-full ring-2 ring-primary/30" />
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-foreground leading-none">{user?.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 capitalize">{user?.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2 cursor-pointer text-sm">
              <User size={14} /> Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive text-sm">
              <LogOut size={14} /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
