import { Link } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
    const { token, logout, user, isAdmin } = useAuth();
    const isAuthenticated = !!token;

    const publicNavLinks = [
        { name: "Home", href: "/" },
    ];

    const authNavLinks = [
        { name: "Home", href: "/" },
        { name: "Leads", href: "/leads" },
        { name: "Deals", href: "/deals" },
        { name: "Pipeline", href: "/pipeline" },
        ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
    ];

    const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">CRM</span>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.href}
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* User Actions & Mobile Menu */}
                <div className="flex items-center gap-4">
                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src="/avatars/01.png" alt="@user" />
                                            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email || 'user@example.com'}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost">
                                        Log in
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button>
                                        Sign up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle className="text-left">CRM</SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 mt-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        className="text-lg font-medium hover:text-primary"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                                {isAuthenticated && (
                                    <Link to="/leads" className="text-lg font-medium hover:text-primary">
                                        Leads
                                    </Link>
                                )}
                                <div className="flex flex-col gap-2 mt-4">
                                    {isAuthenticated ? (
                                        <Button variant="outline" onClick={logout}>
                                            Log out
                                        </Button>
                                    ) : (
                                        <>
                                            <Link to="/login">
                                                <Button variant="outline" className="w-full">
                                                    Log in
                                                </Button>
                                            </Link>
                                            <Link to="/register">
                                                <Button className="w-full">
                                                    Sign up
                                                </Button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};
