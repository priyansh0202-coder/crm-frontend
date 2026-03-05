import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { loginUser } from "@/api/auth";
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

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const response = await loginUser(formData);

      if (response.success && response.token) {
        login(response.token, response.user);
        navigate("/");
      } else {
        setError("Login succeeded but no token returned.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const backendError = err.response?.data;
      let errorMessage = "Something went wrong. Please try again.";

      if (backendError) {
        if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.errors && Array.isArray(backendError.errors)) {
          errorMessage = backendError.errors.map((e: any) => e.msg).join(", ");
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
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
            <span className="text-2xl font-bold text-white tracking-tight">
              ⚡ CRM Pro
            </span>
          </div>
          <p className="text-indigo-300 text-sm">
            © 2025 CRM Pro · Trusted by 10,000+ businesses
          </p>
        </div>
      </div>
      <div className="flex w-full lg:w-[40%] items-center justify-center bg-background p-8">
        <Card className="w-full max-w-sm rounded-2xl shadow-2xl border border-border">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Login to your account
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
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

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <Button
                className="w-full  hover:bg-foreground/90 font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full font-semibold"
                disabled={loading}
              >
                Login with Google
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  Sign up
                </Link>
              </p>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
