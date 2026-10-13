import { useState } from "react";
import {Link} from "react-router-dom";
import "./ClothingValueCalculator.css";

const categoryValues = {
  "T-Shirt": 500,
  "Shirt": 700,
  Jeans: 1000,
  Jacket: 1800,
  Dress: 1200,
  Shoes: 1500,
  Other: 600,
};

function ClothingValueCalculator() {
  const [category, setCategory] = useState("T-Shirt");
  const [condition, setCondition] = useState("Good");
  const [age, setAge] = useState("6-12 months");

  const conditionMultipliers = {
    "Like New": 1,
    Good: 0.75,
    Fair: 0.45,
  };

  const ageMultipliers = {
    "Under 6 months": 1,
    "6-12 months": 0.8,
    "1-2 years": 0.6,
    "Over 2 years": 0.35,
  };

  const estimatedValue = Math.round(
    categoryValues[category] *
      conditionMultipliers[condition] *
      ageMultipliers[age]
  );
  return (
  <main className="value-calculator-page">
    <Link to="/" className="back-home-btn">
      ← Back to Home
    </Link>

    <section className="value-calculator-card">
      <div className="value-calculator-heading">
        <span className="value-calculator-icon">♻️</span>
        <h1>Clothing Value Calculator</h1>
        <p>
          Estimate your item's swap value in a few simple steps.
        </p>
      </div>

      <div className="value-calculator-form">
        <label htmlFor="clothing-category">
          Clothing category
        </label>
        <select
          id="clothing-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {Object.keys(categoryValues).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="clothing-condition">Condition</label>
        <select
          id="clothing-condition"
          value={condition}
          onChange={(event) => setCondition(event.target.value)}
        >
          <option>Like New</option>
          <option>Good</option>
          <option>Fair</option>
        </select>

        <label htmlFor="clothing-age">
          How old is the item?
        </label>
        <select
          id="clothing-age"
          value={age}
          onChange={(event) => setAge(event.target.value)}
        >
          <option>Under 6 months</option>
          <option>6-12 months</option>
          <option>1-2 years</option>
          <option>Over 2 years</option>
        </select>
      </div>

      <div className="value-result" aria-live="polite">
        <p>Estimated Swap Value</p>
        <strong>
          ₹{estimatedValue.toLocaleString("en-IN")}
        </strong>
        <span>
          Indicative estimate, not a guaranteed resale price.
        </span>
      </div>
    </section>
  </main>
);

}

export default ClothingValueCalculator;