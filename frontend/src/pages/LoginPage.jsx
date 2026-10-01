import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:5000";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const attemptLogin = async (loginEmail, loginPassword, skipNavigation = false) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: loginEmail,
        password: loginPassword,
      });

      const { role } = response.data;
      sessionStorage.setItem("role", role);
      sessionStorage.setItem("user", loginEmail);

      if (!skipNavigation) {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/intro");
        }
      }

      return role;
    } catch (error) {
      console.log(error.response?.data);
      const serverMessage = error.response?.data?.message;
      setMessage(serverMessage || "Unable to authenticate. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Email and password are required.");
      return;
    }

    if (isNewUser) {
      setLoading(true);

      try {
        const response = await axios.post(`${API_BASE}/api/auth/register`, {
          email: email.trim(),
          password,
        });

        alert("Signup successful. Please log in.");
        setIsNewUser(false);
        setMessage("");
        setPassword("");
      } catch (error) {
        console.log(error.response?.data);
        const serverMessage = error.response?.data?.message;
        setMessage(serverMessage || "Unable to authenticate. Please try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    await attemptLogin(email.trim(), password);
  };

  const handleAdminQuickLogin = async () => {
    const quickEmail = "admin@gmail.com";
    const quickPassword = "admin123";

    setIsNewUser(false);
    setEmail(quickEmail);
    setPassword(quickPassword);

    const role = await attemptLogin(quickEmail, quickPassword, true);
    if (!role) {
      return;
    }

    if (role === "admin" || quickEmail.toLowerCase().includes("admin")) {
      sessionStorage.setItem("role", "admin");
      navigate("/admin");
    } else {
      navigate("/intro");
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.logoRow}>
          <div style={styles.logoMark}>CC</div>
          <span style={styles.logoText}>CampusCart</span>
        </div>

        <h1 style={styles.heading}>{isNewUser ? "Create your account" : "Welcome back"}</h1>
        <p style={styles.sub}>
          {isNewUser
            ? "Sign up with your email and password to use CampusCart"
            : "Log in to access your campus marketplace"}
        </p>

        <label style={styles.fieldLabel} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          placeholder="you@example.edu"
        />

        <label style={styles.fieldLabel} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          placeholder="Enter your password"
        />

        <div style={styles.adminHint}>
          Tip: Use an email containing <strong>'admin'</strong> (e.g.,{' '}
          <a href="mailto:admin@gmail.com" style={styles.adminLink}>
            admin@gmail.com
          </a>) to access Admin Panel
        </div>

        {message && <div style={styles.message}>{message}</div>}

        <button type="submit" style={styles.submitBtn} disabled={loading}>
          {loading ? "Please wait..." : isNewUser ? "Sign Up" : "Log In"}
        </button>

        <button
          type="button"
          className="admin-quick-login"
          onClick={handleAdminQuickLogin}
          style={styles.adminQuickLogin}
          disabled={loading}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1f2937";
            e.currentTarget.style.borderColor = "#334155";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111827";
            e.currentTarget.style.borderColor = "#24303f";
          }}
        >
          Login as Admin
        </button>

        <button
          type="button"
          onClick={() => {
            setIsNewUser((prev) => !prev);
            setMessage("");
          }}
          style={styles.toggleBtn}
        >
          {isNewUser ? "Already have an account? Log in" : "New user? Sign up"}
        </button>

        {/* 🛠️ DEV BYPASS */}
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem("role", "student");
            sessionStorage.setItem("user", "dev_user@example.com");
            navigate("/intro");
          }}
          style={{
            ...styles.toggleBtn,
            marginTop: "12px",
            borderColor: "rgba(255,255,255,0.1)",
            color: "#4b5a72",
            fontSize: "11px",
          }}
        >
          Skip to Dashboard (Dev Bypass)
        </button>

        <div style={styles.divider} />
        <p style={styles.footer}>
          Need help? <span style={styles.footerLink}>Contact support</span>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#080b12",
    fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
  },
  form: {
    background: "#0e1117",
    border: "1px solid #1e2535",
    borderRadius: 16,
    padding: "48px 44px",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 400,
    boxSizing: "border-box",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 32,
  },
  logoMark: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
    letterSpacing: "-0.5px",
    flexShrink: 0,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 600,
    color: "#e2e8f0",
    letterSpacing: "-0.2px",
  },
  heading: {
    margin: "0 0 6px",
    fontSize: 22,
    fontWeight: 600,
    color: "#f1f5f9",
    letterSpacing: "-0.5px",
    lineHeight: 1.2,
  },
  sub: {
    margin: "0 0 28px",
    fontSize: 14,
    color: "#4b5a72",
    lineHeight: 1.5,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "#94a3b8",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    background: "#131720",
    border: "1px solid #1e2535",
    borderRadius: 12,
    color: "#f8fafc",
    padding: "14px 16px",
    marginBottom: 18,
    fontSize: 14,
    outline: "none",
  },
  adminHint: {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 1.5,
    marginBottom: 16,
  },
  adminLink: {
    color: "#7c3aed",
    textDecoration: "none",
  },
  adminQuickLogin: {
    width: "100%",
    padding: "12px 20px",
    borderRadius: 12,
    border: "1px solid #24303f",
    background: "#111827",
    color: "#cbd5e1",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 12,
    transition: "background 150ms ease, border-color 150ms ease",
  },
  message: {
    color: "#f87171",
    fontSize: 13,
    marginBottom: 18,
  },
  submitBtn: {
    width: "100%",
    padding: "13px 20px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
    color: "#fff",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 12,
  },
  toggleBtn: {
    background: "transparent",
    border: "1px solid #334155",
    borderRadius: 12,
    color: "#94a3b8",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 14,
  },
  divider: {
    height: 1,
    background: "#1e2535",
    margin: "24px 0",
  },
  footer: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  footerLink: {
    color: "#8b96b4",
    cursor: "pointer",
  },
};

export default LoginPage;
