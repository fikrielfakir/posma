import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Truck,
  ShoppingCart,
  Receipt,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Brain,
  MessageCircle,
  Lightbulb,
  Shield,
  UserCheck,
  Scan,
  Wallet,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/contexts/AppContext";

const mainNavItems = [
  { title: "dashboard", url: "/", icon: LayoutDashboard },
  { title: "products", url: "/products", icon: Package },
  { title: "stock", url: "/stock", icon: Warehouse },
  { title: "suppliers", url: "/suppliers", icon: Truck },
  { title: "purchases", url: "/purchases", icon: ShoppingCart },
];

const salesNavItems = [
  { title: "pos", url: "/pos", icon: Scan },
  { title: "cashSessions", url: "/cash-sessions", icon: Wallet },
  { title: "invoices", url: "/invoices", icon: FileText },
  { title: "financial", url: "/financial", icon: TrendingUp },
  { title: "customers", url: "/customers", icon: Users },
  { title: "sales", url: "/sales", icon: Receipt },
  { title: "vendors", url: "/vendors", icon: UserCheck },
];

const managementNavItems = [
  { title: "inventory", url: "/inventory", icon: ClipboardList },
  { title: "users", url: "/users", icon: Users },
  { title: "settings", url: "/settings", icon: Settings },
];

const aiNavItems = [
  { title: "Prédictions", url: "/ai/predictions", icon: Brain },
  { title: "Assistant IA", url: "/ai/chatbot", icon: MessageCircle },
  { title: "Recommandations", url: "/ai/recommendations", icon: Lightbulb },
  { title: "Anomalies", url: "/ai/anomalies", icon: Shield },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useApp();

  const isActive = (url: string) => {
    if (url === "/") return location === "/";
    return location.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold">StockFlow</span>
            <span className="text-xs text-muted-foreground">ERP System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">
            {t("dashboard")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`nav-${item.title}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">
            {t("sales")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {salesNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`nav-${item.title}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">
            Gestion
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`nav-${item.title}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide">
            Intelligence Artificielle
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    data-testid={`nav-ai-${item.title}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-3 rounded-lg p-2 hover-elevate active-elevate-2"
              data-testid="user-menu-trigger"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col text-left">
                <span className="text-sm font-medium">Admin</span>
                <span className="text-xs text-muted-foreground">Super Admin</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem data-testid="menu-profile">
              <Users className="mr-2 h-4 w-4" />
              {t("profile")}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-settings">
              <Settings className="mr-2 h-4 w-4" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" data-testid="menu-logout">
              <LogOut className="mr-2 h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
