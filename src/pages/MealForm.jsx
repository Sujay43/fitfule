import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './MealForm.css';

function MealForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    galleryImages: [],
    suitableFor: [],
    price: '',
    chef: {
      name: '',
      avatar: ''
    },
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: '',
      cholesterol: ''
    },
    ingredients: [],
    dietaryInfo: []
  });

  // Add form handling logic...

  return (
    <div className="meal-form">
      <h2>{id ? 'Edit Meal' : 'Create New Meal'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <input
            type="text"
            name="name"
            placeholder="Meal Name"
            value={formData.name}
            onChange={handleChange}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="protein-rich">High Protein</option>
            <option value="low-carb">Low Carb</option>
            <option value="keto">Keto</option>
            <option value="vegan">Vegan</option>
            <option value="paleo">Paleo</option>
          </select>
        </div>

        {/* Fitness Goals */}
        <div className="form-section">
          <h3>Suitable For</h3>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="suitableFor"
                value="weight-loss"
                checked={formData.suitableFor.includes('weight-loss')}
                onChange={handleGoalsChange}
              />
              Weight Loss
            </label>
            <label>
              <input
                type="checkbox"
                name="suitableFor"
                value="muscle-gain"
                checked={formData.suitableFor.includes('muscle-gain')}
                onChange={handleGoalsChange}
              />
              Muscle Gain
            </label>
            {/* Add more fitness goals... */}
          </div>
        </div>

        {/* Nutrition Information */}
        <div className="form-section">
          <h3>Nutrition Information</h3>
          <input
            type="number"
            name="nutrition.calories"
            placeholder="Calories"
            value={formData.nutrition.calories}
            onChange={handleNutritionChange}
          />
          {/* Add more nutrition fields... */}
        </div>

        {/* Ingredients */}
        <div className="form-section">
          <h3>Ingredients</h3>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              {/* Ingredient inputs... */}
            </div>
          ))}e="button" onClick={addIngredient}>
            Add Ingredient
          </button>
        </div>

        <button type="submit" className="btn-primary">
          {id ? 'Update Meal' : 'Create Meal'}
        </button>
      </form>
    </div>
  );
}

export default MealForm; 
          <button typ