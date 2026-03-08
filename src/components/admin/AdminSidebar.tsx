import {
  BarChart3,
  Users,
  Lightbulb,
  MessageSquare,
  Star,
  Activity,
  Settings,
  Cpu,
  Zap,
  LogOut,
  ArrowLeft,
  Hash,
  TrendingUp,
  CreditCard,
  PieChart,
  Layers,
  Anchor,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/admin", icon: BarChart3 },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Reel Ideas", url: "/admin/reel-ideas", icon: Lightbulb },
  { title: "Niches", url: "/admin/niches", icon: Layers },
  { title: "Hook Templates", url: "/admin/hooks", icon: Anchor },
  { title: "Trending Topics", url: "/admin/trending", icon: TrendingUp },
  { title: "Hashtags", url: "/admin/hashtags", icon: Hash },
  { title: "AI Settings", url: "/admin/ai-config", icon: Cpu },
  { title: "Plans & Credits", url: "/admin/plans", icon: CreditCard },
  { title: "Analytics", url: "/admin/analytics", icon: PieChart },
  { title: "API Usage", url: "/admin/api-usage", icon: Activity },
  { title: "Messages", url: "/admin/messages", icon: MessageSquare },
  { title: "Feedback", url: "/admin/feedback", icon: Star },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNav = (url: string) => {
    navigate(url);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <Sidebar collapsible={isMobile ? "offcanvas" : "icon"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="gradient-text font-bold">Viral Reels Admin</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                      onClick={(e) => {
                        if (isMobile) {
                          e.preventDefault();
                          handleNav(item.url);
                        }
                      }}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {(!collapsed || isMobile) && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => { navigate("/app"); if (isMobile) setOpenMobile(false); }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {(!collapsed || isMobile) && "Back to App"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {(!collapsed || isMobile) && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
