import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Floating-label password input with an eye toggle.
 * Drop-in replacement for the existing <div class="fi-field"><input type="password"... pattern.
 */
export default function PasswordField({
  id,
  value,
  onChange,
  label,
  required = false,
  placeholder = " ",
  testId,
  dark = false,
  autoComplete = "current-password",
  ...rest
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={`fi-field ${value ? "has-value" : ""}`} style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        data-testid={testId}
        style={{
          paddingRight: 36,
          ...(dark
            ? { color: "#F9F8F6", borderBottomColor: "rgba(255,255,255,0.25)" }
            : {}),
        }}
        {...rest}
      />
      <label htmlFor={id} style={dark ? { color: "rgba(255,255,255,0.5)" } : {}}>
        {label}{required && " *"}
      </label>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        data-testid={testId ? `${testId}-toggle` : "password-toggle"}
        tabIndex={-1}
        style={{
          position: "absolute",
          right: 0,
          bottom: 8,
          background: "transparent",
          border: "none",
          padding: 4,
          cursor: "pointer",
          color: dark ? "rgba(255,255,255,0.55)" : "#737373",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#CBA153")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = dark ? "rgba(255,255,255,0.55)" : "#737373")
        }
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
