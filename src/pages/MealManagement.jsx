import React, { useState, useEffect } from 'react';
import MealForm from '../components/MealForm/MealForm';
import './MealManagement.css';

function MealManagement() {
  const [meals, setMeals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch('http://localhost:5004/api/meals', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMeals(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddMeal = async (mealData) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch('http://localhost:5004/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add meal');
      }
      
      await fetchMeals();
      setShowForm(false);
    } catch (err) {
      console.error('Error adding meal:', err);
      throw err;
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleUpdateMeal = async (mealData) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/meals/${editingMeal._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(mealData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update meal');
      }
      
      await fetchMeals();
      setShowForm(false);
      setEditingMeal(null);
    } catch (err) {
      console.error('Error updating meal:', err);
      throw err;
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          throw new Error('Admin authentication token missing');
        }
        
        const response = await fetch(`http://localhost:5004/api/meals/${mealId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete meal');
        }

        await fetchMeals();
      } catch (err) {
        console.error('Error deleting meal:', err);
        alert('Failed to delete meal: ' + err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading meals...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="meal-management">
      <div className="header">
        <h1>Meal Management</h1>
        <button 
          className="add-meal-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingMeal(null);
          }}
        >
          {showForm ? 'Cancel' : 'Add New Meal'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingMeal ? 'Edit Meal' : 'Add New Meal'}</h2>
          <MealForm 
            onSubmit={editingMeal ? handleUpdateMeal : handleAddMeal}
            initialData={editingMeal}
          />
        </div>
      )}

      <div className="meals-list">
        <h2>Current Meals</h2>
        <div className="meals-grid">
          {meals.length === 0 ? (
            <p>No meals available</p>
          ) : (
            meals.map(meal => (
              <div key={meal._id} className="meal-card">
                <img src={meal.image} alt={meal.name} />
                <div className="meal-info">
                  <h3>{meal.name}</h3>
                  <p>${meal.price}</p>
                  <div className="meal-actions">
                    <button onClick={() => handleEditMeal(meal)}>Edit</button>
                    <button onClick={() => handleDeleteMeal(meal._id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MealManagement; 