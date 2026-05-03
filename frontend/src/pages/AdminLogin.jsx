import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api, setAdminToken, formatApiError, getAdminToken } from "../lib/api";
import PasswordField from "../components/PasswordField";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgot, setForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [authedCheck, setAuthedCheck] = useState(false);

  useEffect(() => {
    const t = getAdminToken();
    if (t) {
      api.get("/admin/me").then(() => navigate("/admin", { replace: true })).catch(() => setAuthedCheck(true));
    } else {
      setAuthedCheck(true);
    }
    // Run only on mount; navigate is stable from react-router-dom.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      const { data } = await api.post("/admin/login", { email, password });
      if (data.access_token) setAdminToken(data.access_token);
      navigate("/admin", { replace: true });
    } catch (err) {
      setStatus({
        loading: false,
        error: formatApiError(err.response?.data?.detail) || "Login failed",
      });
    }
  };

  const submitForgot = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      await api.post("/admin/forgot-password", { email });
      setStatus({ loading: false, error: "" });
      setForgotSent(true);
    } catch (err) {
      setStatus({
        loading: false,
        error: formatApiError(err.response?.data?.detail) || "Could not send reset email",
      });
    }
  };

  if (!authedCheck) return null;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{ background: "#161616" }}
    >
      <div className="w-full max-w-md" data-testid="admin-login-page">
        <a
          href="/"
          className="overline inline-block mb-10"
          style={{ color: "rgba(255,255,255,0.5)" }}
          data-testid="admin-login-back-home"
        >
          ← Back to site
        </a>
        <div className="font-serif-display" style={{ fontSize: "clamp(2rem,4vw,2.8rem)", color: "#F9F8F6", lineHeight: 1.05 }}>
          Urban <span style={{ color: "#CBA153" }}>Interiors</span>
        </div>
        <div className="overline mt-2" style={{ color: "#737373", letterSpacing: "0.4em" }}>
          Admin Console
        </div>

        {!forgot ? (
          <form onSubmit={submit} className="mt-10 space-y-7">
            <div className={`fi-field ${email ? "has-value" : ""}`} style={{ color: "#F9F8F6" }}>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                data-testid="admin-login-email"
                style={{ color: "#F9F8F6", borderBottomColor: "rgba(255,255,255,0.25)" }}
                autoComplete="email"
              />
              <label htmlFor="email" style={{ color: "rgba(255,255,255,0.5)" }}>Email *</label>
            </div>
            <PasswordField
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="Password"
              required
              testId="admin-login-password"
              dark
              autoComplete="current-password"
            />

            {status.error && (
              <div className="text-sm" style={{ color: "#e88" }} data-testid="admin-login-error">
                {status.error}
              </div>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="btn-fi-gold w-full justify-center"
              data-testid="admin-login-submit"
            >
              {status.loading ? <span className="fi-spin" /> : <>Sign In <ArrowRight size={14} /></>}
            </button>

            <div className="flex justify-between items-center text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              <button
                type="button"
                onClick={() => {
                  setForgot(true);
                  setStatus({ loading: false, error: "" });
                }}
                className="hover:text-[#CBA153]"
                data-testid="admin-login-forgot"
              >
                Forgot password?
              </button>
              <span className="overline" style={{ letterSpacing: "0.25em" }}>
                Secure
              </span>
            </div>
          </form>
        ) : forgotSent ? (
          <div className="mt-10" data-testid="admin-forgot-sent">
            <h2 className="font-serif-display text-2xl" style={{ color: "#F9F8F6" }}>
              Check your inbox
            </h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              If an account exists for <span style={{ color: "#CBA153" }}>{email}</span>, we've
              sent a branded reset link. The link expires in 60 minutes. Be sure to check spam.
            </p>
            <button
              onClick={() => {
                setForgot(false);
                setForgotSent(false);
              }}
              className="btn-fi-gold mt-7"
              data-testid="admin-forgot-back"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={submitForgot} className="mt-10 space-y-7">
            <h2 className="font-serif-display text-2xl" style={{ color: "#F9F8F6" }}>
              Reset password
            </h2>
            <p className="text-sm -mt-3" style={{ color: "rgba(255,255,255,0.55)" }}>
              We'll email you a secure, time-limited link.
            </p>
            <div className={`fi-field ${email ? "has-value" : ""}`}>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder=" "
                data-testid="admin-forgot-email"
                style={{ color: "#F9F8F6", borderBottomColor: "rgba(255,255,255,0.25)" }}
              />
              <label htmlFor="forgot-email" style={{ color: "rgba(255,255,255,0.5)" }}>Email *</label>
            </div>
            {status.error && (
              <div className="text-sm" style={{ color: "#e88" }}>{status.error}</div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForgot(false)}
                className="btn-fi-ghost flex-1 justify-center"
                data-testid="admin-forgot-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status.loading}
                className="btn-fi-gold flex-1 justify-center"
                data-testid="admin-forgot-submit"
              >
                {status.loading ? <span className="fi-spin" /> : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
