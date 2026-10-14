import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AddClothing.css";

function AddClothing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const categoryValues = {
    "T-Shirts": 500,
    Shirts: 700,
    Jeans: 1000,
    Jackets: 1800,
    Dresses: 1200,
    Other: 600,
  };

  const conditionMultipliers = {
    New: 1,
    "Like New": 1,
    Good: 0.75,
    Fair: 0.45,
  };


  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "T-Shirts",
    size: "M",
    condition: "Good",
    imageUrl: "",
  });
    const estimatedValue = Math.round(
    categoryValues[form.category] *
      conditionMultipliers[form.condition]
  );

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      setError("Please login before listing clothes.");
      return;
    }

    let user;
    try {
      user = JSON.parse(savedUser);
    } catch {
      setError("Please login again.");
      return;
    }

    setLoading(true);

    try {
       const formData = new FormData();

formData.append("title", form.title);
formData.append("description", form.description);
formData.append("category", form.category);
formData.append("size", form.size);
formData.append("condition", form.condition);
formData.append("imageUrl", form.imageUrl);
formData.append("estimatedValue", String(estimatedValue));

if (imageFile) {
  formData.append("image", imageFile);
}

const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clothes`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not add clothing.");
      }

      setSuccess("Clothing listed successfully!");

      setTimeout(() => navigate("/browse"), 1000);
    } catch (err) {
      setError(err.message || "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="add-clothing-page">
      <div className="add-clothing-container">
        <Link to="/browse" className="add-back-link">
          <span>←</span> Back to Browse
        </Link>

        <div className="add-clothing-heading">
          <span className="add-clothing-tag">♻️ SUSTAINABLE FASHION</span>
          <h1>Give Your Clothes a <span>New Life.</span></h1>
          <p>
            List the clothes you no longer wear and help someone discover
            their next favourite.
          </p>
        </div>

        <div className="add-clothing-card">
          <div className="add-card-heading">
            <div className="add-card-icon">👕</div>
            <div>
              <h2>List an Item</h2>
              <p>Tell us a little about your clothing.</p>
            </div>
          </div>
          {form.imageUrl.trim() && (
  <div className="add-image-preview">
    <p>Image Preview</p>
    <img
      src={form.imageUrl}
      alt={form.title || "Clothing preview"}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
      onLoad={(event) => {
        event.currentTarget.style.display = "block";
      }}
    />
  </div>
)}

          <form className="add-clothing-form" onSubmit={handleSubmit}>
            <div className="add-form-group">
                <div className="add-estimated-value">
  <span>♻️ Estimated Swap Value</span>
  <strong>
    ₹{estimatedValue.toLocaleString("en-IN")}
  </strong>
  <small>
    This is an indicative estimate based on category and condition.
  </small>
</div>
              <label htmlFor="title">Item title <span>*</span></label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Blue denim jacket"
                required
                maxLength={100}
              />
            </div>

            <div className="add-form-group">
              <label htmlFor="description">Description <span>*</span></label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the style, colour and anything else worth knowing..."
                required
                maxLength={1000}
                rows={4}
              />
              <small>{form.description.length}/1000 characters</small>
            </div>

            <div className="add-form-row">
              <div className="add-form-group">
                <label htmlFor="category">Category <span>*</span></label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option>T-Shirts</option>
                  <option>Shirts</option>
                  <option>Jeans</option>
                  <option>Jackets</option>
                  <option>Dresses</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="add-form-group">
                <label htmlFor="size">Size <span>*</span></label>
                <select
                  id="size"
                  name="size"
                  value={form.size}
                  onChange={handleChange}
                >
                  <option>XS</option>
                  <option>S</option>
                  <option>M</option>
                  <option>L</option>
                  <option>XL</option>
                  <option>XXL</option>
                </select>
              </div>
            </div>

            <div className="add-form-group">
              <label htmlFor="condition">Item condition <span>*</span></label>
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
              >
                <option>New</option>
                <option>Like New</option>
                <option>Good</option>
                <option>Fair</option>
              </select>
            </div>

            <div className="add-form-group">
              <label htmlFor="imageUrl">Image URL <span className="optional">(Optional)</span></label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={form.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/your-clothing.jpg"
              />
              <small>Paste a publicly accessible image URL.</small>
            </div>
            <div className="add-form-group">
  <label htmlFor="imageFile">
    Upload clothing photo <span className="optional">(Optional)</span>
  </label>

  <input
    id="imageFile"
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please select an image file.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5 MB.");
        event.target.value = "";
        return;
      }

      setError("");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }}
  />

  <small>Select a photo from your computer. Maximum size: 5 MB.</small>

  {imagePreview && (
    <div className="add-image-preview">
      <p>Selected Photo</p>
      <img src={imagePreview} alt="Selected clothing preview" />
    </div>
  )}
</div>

            {error && (
              <div className="add-form-message add-form-error" role="alert">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="add-form-message add-form-success" role="status">
                ✓ {success}
              </div>
            )}

            <button
              className="add-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Listing your item..." : "List My Clothing  →"}
            </button>

            <p className="add-form-note">
              ♻️ Every swap is a step towards a more sustainable wardrobe.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default AddClothing;