import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormValues } from "../forms/auth.schema";
import { DEMO_EMAIL, DEMO_PASSWORD } from "../config/demo";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sessionMessage, clearSessionMessage } = useAuth();

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registrationSuccess = Boolean((location.state as any)?.registered);
  // One-shot auth notice (e.g., token expiry) managed centrally by AuthContext.
  const sessionExpired = sessionMessage ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect path after login
  const from = (location.state as any)?.from?.pathname || "/ops/overview";

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      setError(null);

      const res = await loginApi({
        email: values.email,
        password: values.password,
      });

      // Save token in context
      login(res.token, res.user);

      // Redirect
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError(null);
      clearSessionMessage();

      const res = await loginApi({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      login(res.token, res.user);
      navigate("/ops/overview", { replace: true });
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6 text-center">Sign In</h1>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        {registrationSuccess && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            Account created successfully. Please sign in.
          </div>
        )}

        {sessionExpired && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            {sessionExpired}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>

            <input
              type="email"
              {...register("email")}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              autoFocus
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>

            <input
              type="password"
              {...register("password")}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || demoLoading}
            onClick={() => clearSessionMessage()}
            className="w-full py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
          className="w-full mt-3 py-2 rounded border border-amber-300 bg-amber-50 text-amber-800 font-medium hover:bg-amber-100 transition disabled:bg-gray-100 disabled:text-gray-500"
        >
          {demoLoading ? "Signing in demo..." : "🚀 Try Demo Account"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
