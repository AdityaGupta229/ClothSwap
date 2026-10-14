import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = import.meta.env.VITE_API_URL+"/api";
const CLOTHES_URL = `${API_URL}/admin/clothes`;
const SWAPS_URL = `${API_URL}/admin/swaps`;

function AdminDashboard() {
const [stats, setStats] = useState(null);
const [clothes, setClothes] = useState([]);
const [swaps, setSwaps] = useState([]);

const [loading, setLoading] = useState(true);
const [clothesLoading, setClothesLoading] = useState(true);
const [swapsLoading, setSwapsLoading] = useState(true);

const [error, setError] = useState("");
const [clothesError, setClothesError] = useState("");
const [swapsError, setSwapsError] = useState("");

const [deletingId, setDeletingId] = useState("");
const [updatingId, setUpdatingId] = useState("");
const [notice, setNotice] = useState("");

const savedUser = (() => {
try {
return JSON.parse(localStorage.getItem("user") || "null");
} catch {
return null;
}
})();

useEffect(() => {
let active = true;

async function loadDashboard() {
  const token = localStorage.getItem("token");

  if (!token) {
    if (active) {
      setError("Please login first.");
      setClothesError("Please login first.");
      setSwapsError("Please login first.");
      setLoading(false);
      setClothesLoading(false);
      setSwapsLoading(false);
    }
    return;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  async function loadSection(url, setData, setSectionError, setSectionLoading, fallbackMessage) {
    try {
      const response = await fetch(url, { headers });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || fallbackMessage);
      }

      if (active) setData(result.data);
    } catch (err) {
      if (active) setSectionError(err.message);
    } finally {
      if (active) setSectionLoading(false);
    }
  }

  await Promise.all([
    loadSection(
      `${API_URL}/admin/stats`,
      setStats,
      setError,
      setLoading,
      "Could not load dashboard."
    ),
    loadSection(
      CLOTHES_URL,
      setClothes,
      setClothesError,
      setClothesLoading,
      "Could not load clothing listings."
    ),
    loadSection(
      SWAPS_URL,
      setSwaps,
      setSwapsError,
      setSwapsLoading,
      "Could not load swap requests."
    ),
  ]);
}

loadDashboard();

return () => {
  active = false;
};

}, []);

async function handleDelete(clothing) {
if (
!window.confirm(
`Are you sure you want to delete "${clothing.title || "this listing"}"?`
)
) {
return;
}

setDeletingId(clothing._id);
setClothesError("");
setNotice("");

try {
  const response = await fetch(`${CLOTHES_URL}/${clothing._id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not delete listing.");
  }

  setClothes((current) =>
    current.filter((item) => item._id !== clothing._id)
  );

  setStats((current) =>
    current
      ? {
          ...current,
          totalClothes: Math.max(0, current.totalClothes - 1),
        }
      : current
  );

  setNotice("Clothing listing deleted successfully.");
} catch (err) {
  setClothesError(err.message);
} finally {
  setDeletingId("");
}

}

async function handleStatusChange(swapId, status) {
setUpdatingId(swapId);
setSwapsError("");
setNotice("");

try {
  const response = await fetch(`${SWAPS_URL}/${swapId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not update swap status.");
  }

  setSwaps((current) =>
    current.map((swap) =>
      swap._id === swapId ? { ...swap, ...result.data } : swap
    )
  );

  setStats((current) => {
    if (!current) return current;

    const oldSwap = swaps.find((swap) => swap._id === swapId);
    if (!oldSwap || oldSwap.status === status) return current;

    let pendingRequests = current.pendingRequests;

    if (oldSwap.status === "Pending") pendingRequests -= 1;
    if (status === "Pending") pendingRequests += 1;

    return {
      ...current,
      pendingRequests: Math.max(0, pendingRequests),
    };
  });

  setNotice("Swap request status updated successfully.");
} catch (err) {
  setSwapsError(err.message);
} finally {
  setUpdatingId("");
}

}

if (savedUser?.role !== "admin") {
return <Navigate to="/" replace />;
}

return (
<main className="admin-dashboard">
<header className="admin-header">
<div>
<p className="admin-eyebrow">CLOTH SWAP</p>
<h1>Admin Dashboard</h1>
<p>Welcome, {savedUser.name}</p>
</div>

    <Link to="/" className="admin-home-link">
      Back to Home
    </Link>
  </header>

  {loading ? (
    <p className="admin-message">Loading dashboard...</p>
  ) : error ? (
    <p className="admin-error">{error}</p>
  ) : (
    <>
      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Total Users</span>
          <strong>{stats?.totalUsers ?? 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Clothing Listings</span>
          <strong>{stats?.totalClothes ?? 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Swap Requests</span>
          <strong>{stats?.totalRequests ?? 0}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Pending Requests</span>
          <strong>{stats?.pendingRequests ?? 0}</strong>
        </article>
      </section>

      <section className="admin-info">
        <h2>Platform Overview</h2>
        <p>
          Monitor your community's clothing listings and swap activity
          from one place.
        </p>
      </section>
    </>
  )}

  {notice && <p className="admin-success">{notice}</p>}

  <section className="admin-clothes-section">
    <h2>Manage Clothes Listings</h2>
    <p>View and remove clothing listings from the platform.</p>

    {clothesLoading ? (
      <p className="admin-message">Loading clothing listings...</p>
    ) : clothesError ? (
      <p className="admin-error">{clothesError}</p>
    ) : clothes.length === 0 ? (
      <p className="admin-message">No clothing listings found.</p>
    ) : (
      <div className="admin-table-wrapper">
        <table className="admin-clothes-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Size</th>
              <th>Condition</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {clothes.map((clothing) => (
              <tr key={clothing._id}>
                <td>{clothing.title || "Untitled"}</td>
                <td>{clothing.category || "—"}</td>
                <td>{clothing.size || "—"}</td>
                <td>{clothing.condition || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="admin-delete-button"
                    disabled={deletingId === clothing._id}
                    onClick={() => handleDelete(clothing)}
                  >
                    {deletingId === clothing._id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>

  <section className="admin-clothes-section">
    <h2>Manage Swap Requests</h2>
    <p>Review swap requests and update their status.</p>

    {swapsLoading ? (
      <p className="admin-message">Loading swap requests...</p>
    ) : swapsError ? (
      <p className="admin-error">{swapsError}</p>
    ) : swaps.length === 0 ? (
      <p className="admin-message">No swap requests found.</p>
    ) : (
      <div className="admin-table-wrapper">
        <table className="admin-clothes-table">
          <thead>
            <tr>
              <th>Requester</th>
              <th>Clothing</th>
              <th>Message</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {swaps.map((swap) => (
              <tr key={swap._id}>
                <td>
                  {swap.requesterName ||
                    swap.requester?.name ||
                    "Unknown"}
                </td>
                <td>{swap.clothing?.title || "Listing unavailable"}</td>
                <td>{swap.message || "—"}</td>
                <td>{swap.status}</td>
                <td>
                  <select
                    value={swap.status}
                    disabled={updatingId === swap._id}
                    onChange={(event) =>
                      handleStatusChange(swap._id, event.target.value)
                    }
                    aria-label={`Update status for ${swap.requesterName || "swap request"}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {updatingId === swap._id && (
                    <span> Saving...</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
</main>

);
}

export default AdminDashboard;