import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SwapContext = createContext(null);
const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/swaps`;

function formatRequest(request) {
  const clothing = request.clothing || {};

  return {
    id: request._id,
    itemId: clothing._id || request.clothing,
    name: clothing.title || "Clothing item",
    category: clothing.category || "Other",
    size: clothing.size || "Not specified",
    image: clothing.imageUrl || "👕",
    status: request.status,
    date: request.createdAt
      ? new Date(request.createdAt).toLocaleDateString("en-IN")
      : "",
    requesterName: request.requesterName,
  };
}

export function SwapProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRequests() {
      const token = localStorage.getItem("token");

      if (!token) {
        setRequests([]);
        setLoadingRequests(false);
        return;
      }

      setLoadingRequests(true);

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Could not load swap requests"
          );
        }

        if (active) {
          setRequests((result.data || []).map(formatRequest));
        }
      } catch (error) {
        if (active) {
          console.error("Loading swap requests failed:", error);
        }
      } finally {
        if (active) {
          setLoadingRequests(false);
        }
      }
    }

    loadRequests();

    // Reload requests after login or logout.
    window.addEventListener("auth-change", loadRequests);

    return () => {
      active = false;
      window.removeEventListener("auth-change", loadRequests);
    };
  }, []);

  async function addRequest(item) {
    const token = localStorage.getItem("token");

    if (!token) {
      window.alert("Please login before requesting a swap.");
      return false;
    }

    const requesterName = window.prompt(
      "Enter your name to request this swap:"
    );

    if (!requesterName || !requesterName.trim()) {
      return false;
    }

    const alreadyRequested = requests.some(
      (request) =>
        request.itemId === item.itemId &&
        request.status === "Pending"
    );

    if (alreadyRequested) {
      window.alert("You already have a pending request for this item.");
      return false;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          clothingId: item.itemId,
          requesterName: requesterName.trim(),
          message: "",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create swap request"
        );
      }

      const savedRequest = formatRequest({
        ...result.data,
        clothing: {
          _id: item.itemId,
          title: item.name,
          category: item.category,
          size: item.size,
          imageUrl:
            typeof item.image === "string" &&
            item.image.startsWith("http")
              ? item.image
              : "",
        },
      });

      setRequests((previous) => [
        savedRequest,
        ...previous.filter(
          (request) => request.id !== savedRequest.id
        ),
      ]);

      return true;
    } catch (error) {
      console.error("Creating swap request failed:", error);
      window.alert(error.message);
      return false;
    }
  }

  async function cancelRequest(requestId) {
    const token = localStorage.getItem("token");

    if (!token) {
      window.alert("Please login before cancelling a request.");
      return false;
    }

    try {
      const response = await fetch(
        `${API_URL}/${requestId}/cancel`,
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
          result.message || "Could not cancel request."
        );
      }

      setRequests((previous) =>
        previous.map((request) =>
          request.id === requestId
            ? { ...request, status: "Cancelled" }
            : request
        )
      );

      return true;
    } catch (error) {
      window.alert(error.message);
      return false;
    }
  }

  return (
    <SwapContext.Provider
      value={{
        requests,
        loadingRequests,
        addRequest,
        cancelRequest,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}

export function useSwaps() {
  const context = useContext(SwapContext);

  if (!context) {
    throw new Error(
      "useSwaps must be used inside SwapProvider"
    );
  }

  return context;
}