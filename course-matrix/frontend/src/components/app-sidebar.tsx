import * as React from "react";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Logo from "./logo";
import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Bot, GitCompareIcon } from "lucide-react";

const checkIfActive = (url: string, current: string) => {
  return url === current;
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  // Information for sidebar
  const data = {
    versions: ["1.0.1"],
    navMain: [
      {
        title: "You",
        url: "",
        items: [
          {
            title: "My Timetables",
            url: "/dashboard/home",
            isActive: checkIfActive("/dashboard/home", location.pathname),
            icon: Home,
          },
        ],
      },
      {
        title: "Tools",
        url: "",
        items: [
          {
            title: "Timetable Builder",
            url: "/dashboard/timetable",
            isActive: checkIfActive("/dashboard/timetable", location.pathname),
            icon: Calendar,
          },
          {
            title: "AI Assistant",
            url: "/dashboard/assistant",
            isActive: checkIfActive("/dashboard/assistant", location.pathname),
            icon: Bot,
          },
          {
            title: "Timetable Compare",
            url: "/dashboard/compare",
            isActive: checkIfActive("/dashboard/compare", location.pathname),
            icon: GitCompareIcon,
          },
        ],
      },
    ],
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Logo />
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <div>{item.title}</div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
