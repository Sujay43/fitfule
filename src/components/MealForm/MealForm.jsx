import React, { useState } from 'react';
import './MealForm.css';

function MealForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    image: initialData?.image || '',
    category: initialData?.category || '',
    calories: initialData?.calories || '',
    protein: initialData?.protein || '',
    carbs: initialData?.carbs || '',
    fat: initialData?.fat || '',
    preparationTime: initialData?.preparationTime || '',
    isVegetarian: initialData?.isVegetarian || false,
    isVegan: initialData?.isVegan || false,
    isGlutenFree: initialData?.isGlutenFree || false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      alert('Meal saved successfully!');
    } catch (error) {
      alert('Error saving meal: ' + error.message);
    }
  };

  return (
    <form className="meal-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Meal Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price ($)</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Image URL</label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snacks">Snacks</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="calories">Calories</label>
          <input
            type="number"
            id="calories"
            name="calories"
            value={formData.calories}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="protein">Protein (g)</label>
          <input
            type="number"
            id="protein"
            name="protein"
            value={formData.protein}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="carbs">Carbs (g)</label>
          <input
            type="number"
            id="carbs"
            name="carbs"
            value={formData.carbs}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fat">Fat (g)</label>
          <input
            type="number"
            id="fat"
            name="fat"
            value={formData.fat}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="preparationTime">Preparation Time (minutes)</label>
        <input
          type="number"
          id="preparationTime"
          name="preparationTime"
          value={formData.preparationTime}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group checkboxes">
        <label>
          <input
            type="checkbox"
            name="isVegetarian"
            checked={formData.isVegetarian}
            onChange={handleChange}
          />
          Vegetarian
        </label>

        <label>
          <input
            type="checkbox"
            name="isVegan"
            checked={formData.isVegan}
            onChange={handleChange}
          />
          Vegan
        </label>

        <label>
          <input
            type="checkbox"
            name="isGlutenFree"
            checked={formData.isGlutenFree}
            onChange={handleChange}
          />
          Gluten Free
        </label>
      </div>

      <button type="submit" className="submit-btn">
        {initialData ? 'Update Meal' : 'Add Meal'}
      </button>
    </form>
  );
}

export default MealForm; 