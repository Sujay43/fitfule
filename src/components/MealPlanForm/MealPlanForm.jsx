import React, { useState } from 'react';
import './MealPlanForm.css';

function MealPlanForm({ onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    duration: initialData?.duration || '7',
    price: initialData?.price || '',
    targetCalories: initialData?.targetCalories || '',
    type: initialData?.type || 'weight-loss',
    includedMeals: initialData?.includedMeals || [],
    features: initialData?.features || [],
    image: initialData?.image || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      alert('Meal plan saved successfully!');
    } catch (error) {
      alert('Error saving meal plan: ' + error.message);
    }
  };

  return (
    <form className="meal-plan-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Plan Name</label>
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
        <label htmlFor="duration">Duration (days)</label>
        <select
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          required
        >
          <option value="7">7 Days</option>
          <option value="14">14 Days</option>
          <option value="28">28 Days</option>
        </select>
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
        <label htmlFor="targetCalories">Target Daily Calories</label>
        <input
          type="number"
          id="targetCalories"
          name="targetCalories"
          value={formData.targetCalories}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="type">Plan Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="weight-loss">Weight Loss</option>
          <option value="muscle-gain">Muscle Gain</option>
          <option value="maintenance">Maintenance</option>
          <option value="keto">Keto</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="image">Cover Image URL</label>
        <input
          type="url"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="submit-btn">
        {initialData ? 'Update Meal Plan' : 'Create Meal Plan'}
      </button>
    </form>
  );
}

export default MealPlanForm; 