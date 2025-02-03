import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/index";
import {
  BookOpen,
  FileText,
  Home,
  LogOut,
  Menu,
  PlusCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/create", icon: PlusCircle, label: "Create Exam" },
    { path: "/my-exams", icon: FileText, label: "My Exams" },
    { path: "/take-exam", icon: BookOpen, label: "Take Exam" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform duration-300",
          "bg-white border-r border-black/10",
          "w-64",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-black/10">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-2xl font-bold">
                ExamGenius
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden hover:bg-black/5"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path
                    ? "bg-black text-white"
                    : "text-black hover:bg-black/5"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-black/10">
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 text-black hover:bg-black/5"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-0"
        )}
      >
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-black/10 p-4 sticky top-0 z-30 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="hover:bg-black/5"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="text-xl font-bold">
            ExamGenius
          </span>
        </header>

        {/* Content */}
        <main className="p-6 lg:p-8 min-h-[calc(100vh-4rem)] lg:min-h-screen bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
