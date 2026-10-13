import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Browse.css";

const API_URL = "http://localhost:5000/api/swaps";

function IncomingSwapRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadRequests = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login to view incoming swap requests.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/incoming`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Could not load incoming requests."
        );
      }

      setRequests(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load incoming requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function updateRequest(requestId, action) {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login again.");
      return;
    }

    setUpdatingId(requestId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/${requestId}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Could not ${action} this request.`
        );
      }

      await loadRequests();
    } catch (err) {
      setError(err.message || "Could not update the request.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <main className="browse-page requests-page">
      <Link to="/browse" className="back-link">
        ← Back to Browse
      </Link>

      <header className="requests-header">
        <span>♻️ YOUR CLOTHING</span>
        <h1>Incoming Swap Requests</h1>
        <p>
          Review requests from other users for your clothing.
        </p>
      </header>

      <section className="request-stats">
        <div className="request-stat">
          <span>Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div className="request-stat">
          <span>Pending</span>
          <strong>
            {requests.filter((r) => r.status === "Pending").length}
          </strong>
        </div>

        <div className="request-stat">
          <span>Accepted</span>
          <strong>
            {requests.filter((r) => r.status === "Accepted").length}
          </strong>
        </div>
      </section>

      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading incoming requests...</p>
      ) : requests.length === 0 ? (
        <section className="requests-list">
          <h2>No incoming requests yet</h2>
          <p>
            When someone requests one of your clothes, it will appear here.
          </p>
        </section>
      ) : (
        <section className="requests-list">
          <h2>Requests for Your Clothes</h2>

          {requests.map((request) => {
            const clothing = request.clothing || {};
            const requester = request.requester || {};
            const isUpdating = updatingId === request._id;

            return (
              <article className="request-card" key={request._id}>
                <div className="request-image">
                  {clothing.imageUrl ? (
                    <img
                      src={clothing.imageUrl}
                      alt={clothing.title || "Clothing"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "👕"
                  )}
                </div>

                <div className="request-info">
                  <span className="item-category">
                    {clothing.category || "Other"}
                  </span>

                  <h3>{clothing.title || "Clothing item"}</h3>
                  <p>Size: {clothing.size || "Not specified"}</p>
                  <p>
                    Requested by:{" "}
                    {requester.name ||
                      request.requesterName ||
                      "User"}
                  </p>
                  <p>
                    Requested on:{" "}
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString(
                          "en-IN"
                        )
                      : "Date unavailable"}
                  </p>

                  {request.message && <p>Message: {request.message}</p>}
                </div>

                <div className="request-status-area">
  <span
    className={`request-status ${(request.status || "Pending").toLowerCase()}`}
  >
    {request.status}
  </span>

  {request.status === "Pending" && (
    <div className="request-action-buttons">
      <button
        type="button"
        className="request-view-link"
        disabled={isUpdating}
        onClick={() => updateRequest(request._id, "accept")}
      >
        {isUpdating ? "Please wait..." : "Accept"}
      </button>

      <button
        type="button"
        className="cancel-request-btn"
        disabled={isUpdating}
        onClick={() => {
          const confirmed = window.confirm(
            "Are you sure you want to reject this swap request?"
          );

          if (confirmed) {
            updateRequest(request._id, "reject");
          }
        }}
      >
        Reject
      </button>
    </div>
  )}
    {request.status === "Accepted" && (

  <Link
    to={`/swap-chat/${request._id}`}
    className="request-view-link"
  >
    💬 Open Chat
  </Link>
)}

</div>
              </article>
            );
          })}
        </section>
      )}

      <footer className="requests-footer">
        ♻️ Every swap helps give clothes a second life.
      </footer>
    </main>
  );
}

export default IncomingSwapRequests;