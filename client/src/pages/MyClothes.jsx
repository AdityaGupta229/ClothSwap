import { useEffect, useState } from "react";
import { Link ,useNavigate} from "react-router-dom";
import "./Browse.css";

function MyClothes() {
  const [selectedItem, setSelectedItem]= useState(null);
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchMyClothes() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to view your clothes.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/clothes/my-clothes",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not load your clothes."
          );
        }

        setClothes(result.data || []);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchMyClothes();
  }, []);

  if (loading) {
  return (
    <main className="browse-page">
      <Link to="/" className="back-home-btn">
        ← Back to Home
      </Link>
      <p>Loading your clothes...</p>
    </main>
  );
}

  if (error) {
    return (
      <main className="browse-page">
        <Link to="/" className="back-home-btn">
          ← Back to Home
        </Link>
        <h2>{error}</h2>
        <Link to="/login">Login</Link>
      </main>
    );
  }

  return (
    <main className="browse-page">
      <Link to="/" className="back-home-btn">
        ← Back to Home
      </Link>
      <h1>My Clothes</h1>
      {selectedItem && (
  <div className="item-estimated-value">
    <span>✅ Selected for Swap: {selectedItem.title}</span>
    <strong>
      ₹{(Number(selectedItem.estimatedValue) || 0).toLocaleString("en-IN")}
    </strong>
    <button
      type="button"
      className="modal-cancel"
      onClick={() => setSelectedItem(null)}
    >
      Clear Selection
    </button>
  </div>
)}
      <p>Manage your listings and check their estimated swap values.</p>

      {clothes.length === 0 ? (
        <div>
          <p>You haven't added any clothes yet.</p>
          <Link to="/add-clothing">Add Your First Clothing Item</Link>
        </div>
      ) : (
        <div className="browse-grid">
          {clothes.map((item) => (
            <article className="my-clothing-card" key={item._id}>
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="my-clothing-image"
                />
              ) : (
                <div className="clothing-image">👕</div>
              )}

              <div className="item-details">
                <h3>{item.title}</h3>
                <p>{item.category} · Size {item.size}</p>
                <p>Condition: {item.condition}</p>

                <div className="item-estimated-value">
                  <span>♻️ Estimated Swap Value</span>
                  <strong>
                    ₹{(Number(item.estimatedValue) || 0).toLocaleString("en-IN")}
                  </strong>
                </div>

                <Link to={`/browse/${item._id}`} className="swap-btn">
                  View Details
                </Link>
                <button
  type="button"
  className="swap-btn"
  onClick={() =>
    navigate("/browse", { state: { selectedItem: item }})
  }
>
  Select for Swap
</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyClothes;