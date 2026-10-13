import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password kam se kam 8 characters ka hona chahiye.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, city, state }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Signup failed.");
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "Server se connect nahi ho paya.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">♻ Cloth Swap</div>

        <h1>Join Our Community</h1>
        <p className="auth-subtitle">
          Create your account and give your clothes a second life.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Enter your full name"
          />

          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <label htmlFor="signup-city">City</label>
<input
  id="signup-city"
  type="text"
  value={city}
  onChange={(e) => setCity(e.target.value)}
  required
  maxLength={100}
  autoComplete="address-level2"
  placeholder="Enter your city"
/>

<label htmlFor="signup-state">State</label>
<input
  id="signup-state"
  type="text"
  value={state}
  onChange={(e) => setState(e.target.value)}
  required
  maxLength={100}
  autoComplete="address-level1"
  placeholder="Enter your state"
/>

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <Link className="auth-back" to="/">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default Signup;