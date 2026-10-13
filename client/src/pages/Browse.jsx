import { useEffect, useState } from "react";
import "./Browse.css";
import { Link, useLocation } from "react-router-dom";

function getCategoryEmoji(category) {
const emojis = {
"T-Shirts": "👕",
Shirts: "👔",
Jeans: "👖",
Jackets: "🧥",
Dresses: "👗",
Other: "👚",
};

return emojis[category] || "👚";
}

function Browse() {
  const [clothes, setClothes] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [size, setSize] = useState("All Sizes");
  const [view, setView] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();
  const selectedItem = location.state?.selectedItem;
  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    async function fetchClothes() {
      setLoading(true);
      setError("");

      try {
        const currentToken = localStorage.getItem("token");

        let url = "http://localhost:5000/api/clothes";

        if (currentToken) {
          url =
            view === "nearby"
              ? "http://localhost:5000/api/clothes/nearby"
              : "http://localhost:5000/api/clothes/others";
        }

        const response = await fetch(
          url,
          currentToken
            ? {
                headers: {
                  Authorization: `Bearer ${currentToken}`,
                },
              }
            : {}
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not fetch clothing listings."
          );
        }

        if (!cancelled) {
          setClothes(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load clothes. Please check whether the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchClothes();

    return () => {
      cancelled = true;
    };
  }, [view]);

  const filteredClothes = clothes.filter((item) => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Categories" || item.category === category;

    const matchesSize = size === "All Sizes" || item.size === size;

    return matchesSearch && matchesCategory && matchesSize;
  });

  return (
    <main className="browse-page">
      <div style={{ padding: "12px 24px" }}>
        <Link
          to="/"
          style={{
            display: "inline-block",
            padding: "10px 18px",
            background: "#111827",
            color: "#ffffff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Home
        </Link>
      </div>
      <section className="browse-header">
        <span>♻️ CLOTHSWAP MARKETPLACE</span>
        <h1>Find Your Next Favourite</h1>
        <p>
          Discover clothes listed by people in your community
          and swap instead of buying new.
        </p>
      </section>

      <section className="browse-controls">
        {token && (
          <div className="browse-view-toggle">
            <button
              type="button"
              className={view === "all" ? "active" : ""}
              onClick={() => setView("all")}
            >
              All Available Clothes
            </button>

            <button
              type="button"
              className={view === "nearby" ? "active" : ""}
              onClick={() => setView("nearby")}
            >
              📍 Nearby Swaps
            </button>
          </div>
        )}

        <input
          type="text"
          placeholder="Search clothes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>All Categories</option>
          <option>T-Shirts</option>
          <option>Jeans</option>
          <option>Jackets</option>
          <option>Dresses</option>
        </select>

        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
        >
          <option>All Sizes</option>
          <option>S</option>
          <option>M</option>
          <option>L</option>
          <option>XL</option>
          <option>XXL</option>
          <option>32</option>
        </select>
      </section>

      {loading && <p>Loading clothes...</p>}

      {error && (
        <p role="alert">
          {error}
          {view === "nearby" &&
            " Make sure your city and state are saved in your account."}
        </p>
      )}

      {!loading && !error && (
        <section className="clothes-grid">
          {filteredClothes.map((item) => (
            <article className="clothing-card" key={item._id}>
              <div className="item-image">
  <span className="item-image-fallback">
    {getCategoryEmoji(item.category)}
  </span>{item.imageUrl && (
<img
src={item.imageUrl}
alt={item.title || item.category || "Clothing item"}
loading="lazy"
onLoad={(event) => {
event.currentTarget.classList.add("image-loaded");
}}
onError={(event) => {
event.currentTarget.style.display = "none";
}}
/>
)}

  <small>
    {item.status === "Swapped"
      ? "Already Swapped"
      : "Available for Swap"}
  </small>
</div>

              <div className="item-info">
                <span className="item-category">{item.category}</span>

                <h2>{item.title}</h2>

                <div className="item-details">
                  <span>Size: {item.size}</span>
                  <span>{item.condition}</span>
                </div>

                <div className="item-estimated-value">
                  <span>♻️ Estimated Swap Value</span>
                  <strong>
                    ₹{(Number(item.estimatedValue) || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                {selectedItem && (
                  <div className="value-comparison">
                    <p>
                      <strong>🔄 Comparing with your item</strong>
                    </p>
                    <p>
                      Selected: {selectedItem.title || selectedItem.name}
                    </p>
                    <p>
                      Your item value: ₹
                      {(Number(selectedItem.estimatedValue) || 0).toLocaleString("en-IN")}
                    </p>
                    <p>
                      Value difference: ₹
                      {Math.abs(
                        (Number(item.estimatedValue) || 0) -
                          (Number(selectedItem.estimatedValue) || 0)
                      ).toLocaleString("en-IN")}
                    </p>

                    {(() => {
                      const itemValue =
                        Number(item.estimatedValue) || 0;
                      const selectedValue =
                        Number(selectedItem.estimatedValue) || 0;
                      const difference = Math.abs(itemValue - selectedValue);
                      const higherValue = Math.max(itemValue, selectedValue);
                      const percent =
                        higherValue > 0 ? (difference / higherValue) * 100 : 0;

                      const label =
                        percent <= 10
                          ? "🟢 Fair Swap"
                          : percent <= 30
                            ? "🟡 Small Difference"
                            : "🔴 Large Difference";

                      return <p><strong>{label}</strong></p>;
                    })()}
                  </div>
                )}

                <p className="item-location">📍 {item.ownerName}</p>

                <Link
                  to={`/browse/${item._id}`}
                  state={{ selectedItem }}
                  className="swap-btn"
                >
                  View & Swap
                </Link>
              </div>
            </article>
          ))}

          {filteredClothes.length === 0 && (
            <p>
              {view === "nearby"
                ? "No nearby clothes found yet. Try All Available Clothes or check back when more people in your city list clothes."
                : "No clothes found. Try another search or filter."}
            </p>
          )}
        </section>
      )}
    </main>
  );
}

export default Browse;