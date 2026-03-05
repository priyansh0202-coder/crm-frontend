import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { registerUser } from "@/api/auth";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";

export const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user" as "user" | "admin",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await registerUser(formData);

            if (response.success && response.token) {
                login(response.token, {
                    id: response._id,
                    name: response.name,
                    email: response.email,
                    role: response.role,
                });
                navigate("/");
            } else {
                setError("Registration successful but login failed. Please try logging in.");
                navigate("/login");
            }
        } catch (err: any) {
            console.error("Registration error:", err);
            setError(
                err.response?.data?.message || err.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* ── Left panel: image (60%) ── */}
            <div
                className="hidden lg:flex lg:w-[60%] relative overflow-hidden"
                style={{
                    backgroundImage: "url('/login-panel.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                <div className="absolute inset-0 bg-linear-to-br from-violet-900/80 via-indigo-800/70 to-purple-900/80" />
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white tracking-tight">⚡ CRM Pro</span>
                    </div>
                    <p className="text-indigo-300 text-sm">
                        © 2025 CRM Pro · Trusted by 10,000+ businesses
                    </p>
                </div>
            </div>

            {/* ── Right panel: register card (40%) ── */}
            <div className="flex w-full lg:w-[40%] items-center justify-center bg-background p-8">
                <Card className="w-full max-w-sm rounded-2xl shadow-2xl border border-border">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold text-foreground">
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-muted-foreground text-sm">
                            Enter your information below to create your account
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="grid gap-4">
                            {/* Error message */}
                            {error && (
                                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Name field */}
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-sm font-medium">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="John Doe"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* Email field */}
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* Password field */}
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* Create account button */}
                            <Button
                                className="w-full bg-foreground text-background hover:bg-foreground/90 font-semibold"
                                type="submit"
                                disabled={loading}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create account
                            </Button>

                            {/* Sign up with Google */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full font-semibold"
                                disabled={loading}
                            >
                                Sign up with Google
                            </Button>

                            {/* Sign in link */}
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="font-semibold text-foreground underline underline-offset-4"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;
