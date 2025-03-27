import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { Separator } from "@radix-ui/react-separator";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import TimetableBuilder from "../TimetableBuilder/TimetableBuilder";
import AssistantPage from "../Assistant/AssistantPage";
import { RuntimeProvider } from "../Assistant/runtime-provider";
import Home from "../Home/Home";
import { CompareTimetables } from "../Compare/CompareTimetables";

/**
 * Dashboard Component
 *
 * This component serves as the main layout for the dashboard, handling:
 * - **Sidebar Navigation**:  Manage sidebar state.
 * - **Breadcrumb Navigation**: Displays the current page path dynamically based on `useLocation()`.
 * - **User Menu**: Includes `UserMenu` for user-related actions.
 * - **Routing**: Manages dashboard routes with React Router, supporting:
 *   - `/dashboard/home`: Displays the home page.
 *   - `/dashboard/timetable`: Renders the `TimetableBuilder` page component.
 *   - `/dashboard/assistant`: Renders the chatbot AI Assistant page.
 *   - Any unknown path (`*`): Redirects to `/not-found`.
 *
 * @returns {JSX.Element} The rendered dashboard layout.
 */
const Dashboard = () => {
  const location = useLocation();

  return (
    <>
      <RuntimeProvider>
        <div className="w-full">
          <div>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b px-4">
                  <div className="flex flex-row items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                          {location.pathname === "/dashboard/home" ? (
                            <Link to="/dashboard/home">Home</Link>
                          ) : location.pathname === "/dashboard/timetable" ? (
                            <Link to="/dashboard/timetable">
                              Timetable Builder
                            </Link>
                          ) : location.pathname === "/dashboard/assistant" ? (
                            <Link to="/dashboard/assistant">AI Assistant</Link>
                          ) : location.pathname.startsWith(
                              "/dashboard/compare",
                            ) ? (
                            <Link to="/dashboard/compare">
                              Timetable Compare
                            </Link>
                          ) : (
                            <></>
                          )}
                        </BreadcrumbItem>
                        {/* <BreadcrumbSeparator className="hidden md:block" /> */}
                        {/* <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem> */}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                  <UserMenu />
                </header>
                <div>
                  <Routes>
                    <Route path="*" element={<Navigate to="/not-found" />} />
                    <Route path="/" element={<Navigate to="home" replace />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/timetable" element={<TimetableBuilder />} />
                    <Route path="/assistant" element={<AssistantPage />} />
                    <Route path="/compare" element={<CompareTimetables />} />
                  </Routes>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </div>
      </RuntimeProvider>
    </>
  );
};

export default Dashboard;
