import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { UserMenu } from "@/components/UserMenu"
import { Separator } from "@radix-ui/react-separator"
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom"
import TimetableBuilder from "../TimetableBuilder/TimetableBuilder"

const Dashboard = () => {
  const location = useLocation();

  return <>
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
                      {location.pathname === "/dashboard/home" ? 
                      <BreadcrumbLink href="/dashboard/home">
                        <Link to="/dashboard/home" >
                          Home
                        </Link>
                      </BreadcrumbLink> : 
                      location.pathname === "/dashboard/timetable" ?
                      <BreadcrumbLink href="/dashboard/timetable">
                        <Link to="/dashboard/timetable" >
                          Timetable Builder
                        </Link>
                      </BreadcrumbLink> :
                      location.pathname === "/dashboard/assistant" ?
                      <BreadcrumbLink href="/dashboard/assistant">
                        <Link to="/dashboard/assistant" >
                          AI Assistant
                        </Link>
                      </BreadcrumbLink>
                      : <></>
                      }
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
                <Route path="*" element={<Navigate to="/not-found"/>} />  
                <Route path="/" element={<Navigate to="home" replace />} />
                <Route path="/home" element={<>Home</>} />
                <Route path="/timetable" element={<TimetableBuilder />} />
                <Route path="/assistant" element={<>Assistant</>}/>
              </Routes>       
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  </>
}

export default Dashboard