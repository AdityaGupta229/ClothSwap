import { Link } from "react-router-dom";
import "./Browse.css";
import { useSwaps } from "../SwapContext";
 
function MySwapRequests() {
const { requests, cancelRequest } = useSwaps();
  return (
    <main className="browse-page requests-page">
      <Link to="/browse" className="back-link">
        ← Back to Browse
      </Link>

      <header className="requests-header">
        <span>♻️ YOUR SWAP ACTIVITY</span>
        <h1>My Swap Requests</h1>
        <p>
          Keep track of your clothing swap requests
          and discover a more sustainable wardrobe.
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

      <section className="requests-list">
        <h2>Your Requests</h2>

        {requests.map((item) => (
          <article className="request-card" key={item.id}>
            <div className="request-image">{item.image}</div>

            <div className="request-info">
              <span className="item-category">{item.category}</span>
              <h3>{item.name}</h3>
              <p>Size: {item.size}</p>
              <p>Requested on: {item.date}</p>
            </div>

            <div className="request-status-area">
              <span
                className={`request-status ${item.status.toLowerCase()}`}
              >
                {item.status}
              </span>

              <Link
                to="/browse"
                className="request-view-link"
              >
                Browse More
              </Link>
            {item.status === "Accepted" && (
              <Link to={`/swap-chat/${item.id}`} className="request-view-link">
                💬 Open Chat
              </Link>
            )}
            {item.status === "Pending" && (
  <button
    className="cancel-request-btn"
    onClick={() => {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this swap request?"
      );

      if (confirmed) {
        cancelRequest(item.id);
      }
    }}
  >
    Cancel Request
  </button>
)}
            </div>
          </article>
        ))}
      </section>

      <footer className="requests-footer">
        ♻️ Every swap helps give clothes a second life.
      </footer>
    </main>
  );
}

export default MySwapRequests;