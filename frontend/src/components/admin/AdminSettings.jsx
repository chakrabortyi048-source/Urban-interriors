import { useEffect, useState } from "react";
import { Save, Mail, Lock, Building2 } from "lucide-react";
import { api, formatApiError } from "../../lib/api";
import PasswordField from "../PasswordField";

function Section({ title, desc, children }) {
  return (
    <section className="mb-10 p-7" style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4 }}>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="font-serif-display text-xl" style={{ color: "#1A1A1A" }}>
            {title}
          </h2>
          {desc && <p className="text-sm mt-1" style={{ color: "#737373" }}>{desc}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldRow({ label, value, onChange, type = "text", testid, required, name }) {
  if (type === "password") {
    return (
      <PasswordField
        id={name || testid || label}
        value={value}
        onChange={onChange}
        label={label}
        required={required}
        testId={testid}
        autoComplete="off"
      />
    );
  }
  return (
    <div className={`fi-field ${value ? "has-value" : ""}`}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        data-testid={testid}
      />
      <label>{label}{required && " *"}</label>
    </div>
  );
}

export default function AdminSettings({ me, setMe, onLogout }) {
  // Business info
  const [info, setInfo] = useState(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState("");

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPwd, setEmailPwd] = useState("");
  const [emailMsg, setEmailMsg] = useState({ ok: "", err: "" });

  // Password change
  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState({ ok: "", err: "" });

  // Reset link
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    api.get("/admin/business-info").then((r) => setInfo(r.data || {})).catch(() => {});
  }, []);

  const saveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg("");
    try {
      const { data } = await api.put("/admin/business-info", info);
      setInfo(data);
      setInfoMsg("Saved.");
    } catch (err) {
      setInfoMsg(formatApiError(err.response?.data?.detail) || "Save failed");
    } finally {
      setSavingInfo(false);
      setTimeout(() => setInfoMsg(""), 2500);
    }
  };

  const changeEmail = async (e) => {
    e.preventDefault();
    setEmailMsg({ ok: "", err: "" });
    try {
      const { data } = await api.post("/admin/change-email", {
        current_password: emailPwd,
        new_email: newEmail,
      });
      setMe({ ...me, email: data.email });
      setNewEmail("");
      setEmailPwd("");
      setEmailMsg({ ok: "Email updated.", err: "" });
    } catch (err) {
      setEmailMsg({ ok: "", err: formatApiError(err.response?.data?.detail) || "Failed" });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwdMsg({ ok: "", err: "" });
    if (newPwd.length < 8) {
      setPwdMsg({ ok: "", err: "Password must be at least 8 characters" });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ ok: "", err: "Passwords do not match" });
      return;
    }
    try {
      await api.post("/admin/change-password", {
        current_password: curPwd,
        new_password: newPwd,
      });
      setCurPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setPwdMsg({ ok: "Password updated.", err: "" });
    } catch (err) {
      setPwdMsg({ ok: "", err: formatApiError(err.response?.data?.detail) || "Failed" });
    }
  };

  const triggerReset = async () => {
    setResetMsg("");
    try {
      await api.post("/admin/forgot-password", { email: me.email });
      setResetMsg("Reset email queued. Check your inbox.");
    } catch (err) {
      setResetMsg("Could not queue reset email.");
    }
  };

  if (!info) return null;

  return (
    <div data-testid="admin-settings">
      <div className="overline" style={{ color: "#CBA153" }}>Settings</div>
      <h1 className="font-serif-display mt-2" style={{ fontSize: "2.2rem", color: "#1A1A1A" }}>
        Account &amp; business
      </h1>

      <div className="mt-9 grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          {/* Email */}
          <Section title="Change admin email" desc="Confirm with your current password.">
            <form onSubmit={changeEmail} className="grid grid-cols-1 gap-5">
              <div className="text-xs" style={{ color: "#737373" }}>
                Current: <span style={{ color: "#1A1A1A" }}>{me?.email}</span>
              </div>
              <FieldRow label="New email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required testid="settings-new-email" />
              <FieldRow label="Current password" type="password" value={emailPwd} onChange={(e) => setEmailPwd(e.target.value)} required testid="settings-email-current-password" />
              {emailMsg.ok && <div className="text-sm" style={{ color: "#3a8a55" }}>{emailMsg.ok}</div>}
              {emailMsg.err && <div className="text-sm" style={{ color: "#a33" }}>{emailMsg.err}</div>}
              <button type="submit" className="btn-fi-dark self-start" data-testid="settings-change-email-btn">
                <Mail size={14} /> Update Email
              </button>
            </form>
          </Section>

          {/* Password */}
          <Section title="Change password" desc="Use 8 characters or more.">
            <form onSubmit={changePassword} className="grid grid-cols-1 gap-5">
              <FieldRow label="Current password" type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} required testid="settings-current-password" />
              <FieldRow label="New password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required testid="settings-new-password" />
              <FieldRow label="Confirm new password" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required testid="settings-confirm-password" />
              {pwdMsg.ok && <div className="text-sm" style={{ color: "#3a8a55" }}>{pwdMsg.ok}</div>}
              {pwdMsg.err && <div className="text-sm" style={{ color: "#a33" }}>{pwdMsg.err}</div>}
              <button type="submit" className="btn-fi-dark self-start" data-testid="settings-change-password-btn">
                <Lock size={14} /> Update Password
              </button>
            </form>
          </Section>

          <Section title="Forgot it? Reset by email" desc="Send a fresh reset link to your registered email.">
            <button onClick={triggerReset} className="btn-fi-ghost" style={{ color: "#1A1A1A", borderColor: "rgba(0,0,0,0.15)" }} data-testid="settings-reset-email-btn">
              Send Reset Link to {me?.email}
            </button>
            {resetMsg && <div className="text-sm mt-3" style={{ color: "#3a8a55" }}>{resetMsg}</div>}
          </Section>
        </div>

        <div>
          <Section title="Business information" desc="Address, phone, hours and socials shown across the public site.">
            <form onSubmit={saveInfo} className="grid grid-cols-1 gap-5">
              <FieldRow label="Business name" value={info.business_name || ""} onChange={(e) => setInfo({ ...info, business_name: e.target.value })} testid="settings-info-name" />
              <FieldRow label="Address" value={info.address || ""} onChange={(e) => setInfo({ ...info, address: e.target.value })} testid="settings-info-address" />
              <FieldRow label="Phone" value={info.phone || ""} onChange={(e) => setInfo({ ...info, phone: e.target.value })} testid="settings-info-phone" />
              <FieldRow label="WhatsApp number" value={info.whatsapp || ""} onChange={(e) => setInfo({ ...info, whatsapp: e.target.value })} testid="settings-info-whatsapp" />
              <FieldRow label="Email" value={info.email || ""} onChange={(e) => setInfo({ ...info, email: e.target.value })} testid="settings-info-email" />
              <FieldRow label="Working hours" value={info.hours || ""} onChange={(e) => setInfo({ ...info, hours: e.target.value })} testid="settings-info-hours" />
              <FieldRow label="Instagram URL" value={info.instagram || ""} onChange={(e) => setInfo({ ...info, instagram: e.target.value })} testid="settings-info-instagram" />
              <FieldRow label="Facebook URL" value={info.facebook || ""} onChange={(e) => setInfo({ ...info, facebook: e.target.value })} testid="settings-info-facebook" />
              {infoMsg && <div className="text-sm" style={{ color: infoMsg === "Saved." ? "#3a8a55" : "#a33" }}>{infoMsg}</div>}
              <button type="submit" className="btn-fi-dark self-start" disabled={savingInfo} data-testid="settings-save-info-btn">
                {savingInfo ? <span className="fi-spin" /> : <><Save size={14} /> Save Changes</>}
              </button>
            </form>
          </Section>
        </div>
      </div>
    </div>
  );
}
