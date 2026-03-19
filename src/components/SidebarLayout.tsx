import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "../pages/Dashboard.css";
import {
    Users,
    Handshake,
    DollarSign,
    LayoutDashboard,
    BarChart3,
    Search,
    Bell,
    Settings,
    Plus,
    HelpCircle,
    LogOut,
    Menu,
    X,
} from "lucide-react";

export const SidebarLayout = () => {
    const { user, isAdmin, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const sidebarLinks = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Leads", href: "/leads", icon: Users },
        { name: "Deals", href: "/deals", icon: Handshake },
        { name: "Revenue", href: "/pipeline", icon: DollarSign },
        { name: "Reports", href: isAdmin ? "/admin" : "/", icon: BarChart3 },
    ];

    const isActive = (href: string) => {
        if (href === "/") return location.pathname === "/";
        return location.pathname.startsWith(href);
    };

    return (
        <div className="dashboard-layout">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* ── Sidebar ── */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="sidebar-brand">Sales CRM</h1>
                            <p className="sidebar-edition">ENTERPRISE EDITION</p>
                        </div>
                    </div>
                    <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            className={`sidebar-link ${isActive(link.href) ? "sidebar-link-active" : ""}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <link.icon className="h-[18px] w-[18px]" />
                            <span>{link.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/leads" className="sidebar-add-lead-btn" onClick={() => setSidebarOpen(false)}>
                        <Plus className="h-4 w-4" />
                        <span>Add Lead</span>
                    </Link>
                    <button className="sidebar-footer-link">
                        <HelpCircle className="h-[18px] w-[18px]" />
                        <span>Help Center</span>
                    </button>
                    <button className="sidebar-footer-link" onClick={logout}>
                        <LogOut className="h-[18px] w-[18px]" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="dashboard-main">
                {/* ── Top Bar ── */}
                <header className="dashboard-topbar">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </button>
                    <div className="topbar-search">
                        <Search className="topbar-search-icon" />
                        <input
                            type="text"
                            placeholder="Search leads, deals, or reports..."
                            className="topbar-search-input"
                        />
                    </div>
                    <div className="topbar-actions">
                        <button className="topbar-icon-btn">
                            <Bell className="h-5 w-5" />
                        </button>
                        <button className="topbar-icon-btn">
                            <Settings className="h-5 w-5" />
                        </button>
                        <div className="topbar-user">
                            <span className="topbar-user-name">{user?.name ?? "User"}</span>
                            <span className="topbar-user-role">{isAdmin ? "Admin" : "Sales Director"}</span>
                        </div>
                        <div className="topbar-avatar">
                            {user?.name?.[0] ?? "U"}
                        </div>
                    </div>
                </header>

                {/* ── Page Content (rendered via <Outlet />) ── */}
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default SidebarLayout;
