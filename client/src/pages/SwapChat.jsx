import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./SwapChat.css";

const API_URL = "http://localhost:5000/api/messages";

function SwapChat() {
  const { swapId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/${swapId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load chat.");
      }

      setMessages(result.data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [swapId]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim() || sending) return;

    const token = localStorage.getItem("token");
    setSending(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${swapId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: text.trim() }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not send message.");
      }

      setMessages((previous) => [...previous, result.data]);
      setText("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="swap-chat-page">
      <div className="swap-chat-card">
        <header className="swap-chat-header">
          <Link to="/my-requests" className="chat-back-link">
            ← My Requests
          </Link>
          <div className="chat-heading">
            <div className="chat-avatar" aria-hidden="true">
              <span>💬</span>
            </div>
            <div>
              <h1>Swap Chat</h1>
              <p>Discuss your clothing swap</p>
            </div>
          </div>
        </header>

        <section className="chat-messages" aria-live="polite">
          {loading ? (
            <p className="chat-placeholder">Loading messages...</p>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <span>👋</span>
              <h2>Start the conversation!</h2>
              <p>Say hello and discuss your swap.</p>
            </div>
          ) : (
            messages.map((message) => (
              <article className="chat-message" key={message._id}>
                <div className="chat-message-name">
                  {message.sender?.name || message.senderName || "User"}
                </div>
                <p className="chat-message-text">{message.text}</p>
                <time className="chat-message-time">
                  {message.createdAt
                    ? new Date(message.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </time>
              </article>
            ))
          )}
        </section>

        {error && (
          <p className="chat-error" role="alert">
            {error}
          </p>
        )}

        <form className="chat-compose" onSubmit={sendMessage}>
          <input
            className="chat-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type your message..."
            maxLength={1000}
            aria-label="Message"
          />
          <button
            className="chat-send-button"
            type="submit"
            disabled={sending || !text.trim()}
          >
            {sending ? "Sending..." : "Send ➤"}
          </button>
        </form>
        <p className="chat-footer-note">Be kind. Happy swapping!</p>
      </div>
    </main>
  );
}

export default SwapChat;