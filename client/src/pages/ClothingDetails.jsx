import { Link, useParams , useLocation } from "react-router-dom";
import "./Browse.css";
import { useEffect, useState } from "react";
import { useSwaps } from "../SwapContext";

function ClothingDetails() {
  const { id } = useParams();
  const location = useLocation();
  const selectedItem = location.state?.selectedItem;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapSubmitted, setSwapSubmitted] = useState(false);

  const { addRequest } = useSwaps();

  useEffect(() => {
    const fetchClothing = async () => {
      setLoading(true);
      setError("");
      setItem(null);

      try {
        const response = await fetch(
          `http://localhost:5000/api/clothes/${id}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Clothing item not found"
              : "Could not load clothing item"
          );
        }

        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchClothing();
  }, [id]);

  if (loading) {
    return (
      <main className="browse-page">
        <p>Loading clothing details...</p>
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="browse-page">
        <h1>{error || "Clothing item not found"}</h1>
        <Link to="/browse">← Back to Browse</Link>
      </main>
    );
  }

  const title = item.title || item.name || "Untitled Item";
  const image = item.imageUrl || "";
  const category = item.category || "Other";
  const size = item.size || "Not specified";
  const condition = item.condition || "Not specified";
  const description =
    item.description || "No description provided.";
  const estimatedValue = Number(item.estimatedValue) || 0;

const yourItemValue = Number(selectedItem?.estimatedValue) || 0;
const valueDifference = Math.abs(estimatedValue - yourItemValue);
const higherValue = Math.max(estimatedValue, yourItemValue);

const differencePercent =
  higherValue > 0 ? (valueDifference / higherValue) * 100 : 0;

const swapLabel =
  differencePercent <= 10
    ? "🟢 Fair Swap"
    : differencePercent <= 30
    ? "🟡 Small Difference"
    : "🔴 Large Difference";
  const owner = item.ownerName || "Cloth Swap Member";

  const handleSwapRequest = async () => {
    const added = addRequest({
      itemId: item._id,
      name: title,
      category,
      size,
      image: image || "👕",
    });

    if (added) {
      setSwapSubmitted(true);
    } else {
      alert("You already have a pending request for this item!");
    }
  };

  return (
    <main className="browse-page">
      <Link to="/browse">← Back to Browse</Link>

      <section className="clothing-details">
        <div className="details-image">
          {image ? (
            <img
              src={image}
              alt={title}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "contain",
              }}
            />
          ) : (
            <span>👕</span>
          )}
        </div>

        <div className="details-info">
          <p>{category}</p>
          <h1>{title}</h1>

        <p>Size: {size}</p>
<p>Condition: {condition}</p>

<div className="details-estimated-value">
  <span>♻️ Estimated Swap Value</span>
  <strong>
    ₹{estimatedValue.toLocaleString("en-IN")}
  </strong>
</div>

<p>📍 Owner: {owner}</p>

          <div className="product-description">
            <h3>About This Item</h3>
            <p>{description}</p>
          </div>

          <div className="product-highlights">
            <div className="highlight-item">
              <span>♻️</span>
              <p>Sustainable Choice</p>
            </div>

            <div className="highlight-item">
              <span>✨</span>
              <p>Unique Style</p>
            </div>

            <div className="highlight-item">
              <span>🌿</span>
              <p>Less Waste</p>
            </div>
          </div>

          <div className="owner-card">
            <div className="owner-avatar">👤</div>
            <div className="owner-info">
              <h3>{owner}</h3>
              <p>♻️ Sustainable fashion community</p>
            </div>
          </div>

          <button
            className="share-btn"
            onClick={async () => {
              const shareData = {
                title,
                text: `Check out ${title} on Cloth Swap!`,
                url: window.location.href,
              };

              if (navigator.share) {
                try {
                  await navigator.share(shareData);
                } catch (err) {
                  if (err.name !== "AbortError") {
                    alert("Sharing was unsuccessful.");
                  }
                }
              } else {
                try {
                  await navigator.clipboard.writeText(
                    shareData.url
                  );
                  alert("Product link copied!");
                } catch {
                  alert("Please copy the product URL.");
                }
              }
            }}
          >
            🔗 Share This Item
          </button>

          <button
            className="swap-btn"
            disabled={item.status === "Swapped"}
            onClick={() => {
              setSwapSubmitted(false);
              setShowSwapModal(true);
            }}
          >
            {item.status === "Swapped"
              ? "Item Already Swapped"
              : "🔄 Request a Swap"}
          </button>
        </div>
      </section>

      {showSwapModal && (
        <div className="swap-modal-overlay">
          <div className="swap-modal">
            <button
              className="modal-close"
              onClick={() => setShowSwapModal(false)}
              aria-label="Close dialog"
            >
              ×
            </button>

            {swapSubmitted ? (
              <>
                <div className="modal-icon">🎉</div>
                <h2>Request Created!</h2>
                <p>
                  Your request for {title} has been added
                  to your local swap requests.
                </p>
                <p className="demo-note">
                  <p>More Style, Less waste!</p> 
                  
                  <p>Swap your clothes. Refresh your wardrobe. Make a difference.</p>
                </p>
                <button
                  className="swap-btn"
                  onClick={() => setShowSwapModal(false)}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="modal-icon">♻️</div>
                <h2>Request a Swap</h2>
                <p>
                  Interested in <strong>{title}</strong>?
                </p>

                <div className="swap-summary">
                  <span>
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      "👕"
                    )}
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>
                      Size: {size} · {condition}
                    </p>
                    <p className="swap-summary-value">
                      Estimated Value: ₹{estimatedValue.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                {selectedItem && (
  <div className="value-comparison">
    <h3>🔄 Swap Value Comparison</h3>

    <p>
      Your item: {selectedItem.title || selectedItem.name}
    </p>

    <p>
      Your item value: ₹
      {yourItemValue.toLocaleString("en-IN")}
    </p>

    <p>
      Other item value: ₹
      {estimatedValue.toLocaleString("en-IN")}
    </p>

    <p>
      Value difference: ₹
      {valueDifference.toLocaleString("en-IN")}
    </p>

    <p><strong>{swapLabel}</strong></p>
  </div>
)}

                <button
                  className="swap-btn"
                  onClick={handleSwapRequest}
                >
                  Confirm Swap Request
                </button>

                <button
                  className="modal-cancel"
                  onClick={() => setShowSwapModal(false)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default ClothingDetails;