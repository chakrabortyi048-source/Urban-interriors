import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, formatApiError, setAdminToken } from "../lib/api";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PasswordField from "../components/PasswordField";

export default function AdminResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", ok: false });

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setStatus({ loading: false, error: "Password must be at least 8 characters", ok: false });
      return;
    }
    if (password !== confirm) {
      setStatus({ loading: false, error: "Passwords do not match", ok: false });
      return;
    }
    setStatus({ loading: true, error: "", ok: false });
    try {
      await api.post("/admin/reset-password", { token, new_password: password });
      setAdminToken(null);
      setStatus({ loading: false, error: "", ok: true });
    } catch (err) {
      setStatus({
        loading: false,
        error: formatApiError(err.response?.data?.detail) || "Reset failed",
        ok: false,
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "#161616" }}
    >
      <div className="w-full max-w-md" data-testid="admin-reset-page">
        <div className="font-serif-display" style={{ fontSize: "clamp(2rem,4vw,2.6rem)", color: "#F9F8F6", lineHeight: 1.05 }}>
          Set a new <span style={{ color: "#CBA153", fontStyle: "italic" }}>password.</span>
        </div>
        {!token && (
          <p className="mt-5 text-sm" style={{ color: "#e88" }}>
            Missing or invalid token. Please request a new reset link.
          </p>
        )}

        {status.ok ? (
          <div className="mt-10" data-testid="admin-reset-success">
            <CheckCircle2 size={28} style={{ color: "#CBA153" }} />
            <h2 className="font-serif-display text-2xl mt-4" style={{ color: "#F9F8F6" }}>
              Password updated
            </h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              Your password has been changed. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate("/admin/login")}
              className="btn-fi-gold mt-7"
              data-testid="admin-reset-go-login"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-7">
            <PasswordField
              id="np"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              label="New Password"
              required
              testId="admin-reset-password"
              dark
              autoComplete="new-password"
            />
            <PasswordField
              id="cp"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              label="Confirm Password"
              required
              testId="admin-reset-confirm"
              dark
              autoComplete="new-password"
            />
            {status.error && (
              <div className="text-sm" style={{ color: "#e88" }} data-testid="admin-reset-error">
                {status.error}
              </div>
            )}
            <button
              type="submit"
              disabled={status.loading || !token}
              className="btn-fi-gold w-full justify-center"
              data-testid="admin-reset-submit"
            >
              {status.loading ? <span className="fi-spin" /> : <>Update Password <ArrowRight size={14} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
