import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { SwapProvider } from "./SwapContext";

import Browse from "./pages/Browse";
import ClothingDetails from "./pages/ClothingDetails";
import MySwapRequests from "./pages/MySwapRequests";
import IncomingSwapRequests from "./pages/IncomingSwapRequests";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AddClothing from "./pages/AddClothing";
import SwapChat from "./pages/SwapChat";
import ClothingValueCalculator from "./pages/ClothingValueCalculator";
import MyClothes from "./pages/MyClothes";

function Home() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    function loadUser() {
      const savedUser = localStorage.getItem("user");

      try {
        setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setCurrentUser(null);
      }
    }

    loadUser();

    window.addEventListener("storage", loadUser);
    window.addEventListener("auth-change", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
      window.removeEventListener("auth-change", loadUser);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    setCurrentUser(null);
  }

  return (
    <div className="app">
      <nav className="navbar">
        <Link to="/" className="brand">
          Cloth<span>Swap</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/browse">Browse</Link>
          <Link to="/my-requests">My Requests</Link>

          {currentUser && (
            <Link to="/incoming-requests">Incoming</Link>
          )}

          <Link to="/value-calculator">Value Calculator</Link>

          {currentUser && (
            <>
              <Link to="/add-clothing">Add Clothing +</Link>
              <Link to="/my-clothes">My Clothes</Link>
            </>
          )}

          {currentUser?.role === "admin" && (
            <Link to="/admin">Admin</Link>
          )}

          <a href="#how-it-works">How It Works</a>

          {currentUser ? (
            <>
              <span className="welcome-user">
                Hi, {currentUser.name}
              </span>

              <button className="signup-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/signup" className="signup-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="tag">♻️ Sustainable Fashion</span>

          <h1>
            Give Your Clothes
            <br />
            <span>A Second Life.</span>
          </h1>

          <p>
            Exchange clothes you no longer need and discover
            something new from our community.
          </p>

          <div className="hero-buttons">
            <Link to="/browse" className="primary-btn">
              Browse Clothes
            </Link>

            <a href="#how-it-works" className="secondary-btn">
              How It Works
            </a>
          </div>
        </div>

        <div className="hero-card">
          <div className="clothing-image">
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=80"
              alt="Clothes arranged on a clothing rack"
            />
          </div>

          <div className="floating-card top-card">
            ♻️ Sustainable
          </div>

          <div className="floating-card bottom-card">
            🔄 Easy Swap
          </div>

          <div className="hero-card-content">
            <h3>Swap. Discover. Repeat.</h3>
            <p>Give your unused clothes a second life.</p>
          </div>
        </div>
      </section>

      <section className="categories" id="categories">
        <h2>Explore Clothing</h2>
        <p>Find something you would love to swap.</p>

        <div className="category-grid">
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
              alt="T-shirts"
              loading="lazy"
            />
            <h3>T-Shirts</h3>
          </div>

          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"
              alt="Jeans"
              loading="lazy"
            />
            <h3>Jeans</h3>
          </div>

          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
              alt="Jackets"
              loading="lazy"
            />
            <h3>Jackets</h3>
          </div>

          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"
              alt="Dresses"
              loading="lazy"
            />
            <h3>Dresses</h3>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works">
        <h2>How Cloth Swap Works</h2>
        <p>Three simple steps to refresh your wardrobe.</p>

        <div className="steps-grid">
          <div className="step-card">
            <span>01</span>
            <h3>List Your Clothes</h3>
            <p>Add clothes you no longer wear.</p>
          </div>

          <div className="step-card">
            <span>02</span>
            <h3>Discover &amp; Connect</h3>
            <p>Explore listings from your community.</p>
          </div>

          <div className="step-card">
            <span>03</span>
            <h3>Swap &amp; Reuse</h3>
            <p>
              Find a new favourite and give clothes another life.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <h3>Cloth Swap ♻️</h3>
        <p>Wear something new. Waste a little less.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <SwapProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse/:id" element={<ClothingDetails />} />
        <Route path="/my-requests" element={<MySwapRequests />} />
        <Route
          path="/incoming-requests"
          element={<IncomingSwapRequests />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-clothing" element={<AddClothing />} />
        <Route path="/swap-chat/:swapId" element={<SwapChat />} />
        <Route
          path="/value-calculator"
          element={<ClothingValueCalculator />}
        />
        <Route path="/my-clothes" element={<MyClothes />} />
      </Routes>
    </SwapProvider>
  );
}

export default App;