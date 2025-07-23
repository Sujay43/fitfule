import React, { useState, useEffect } from 'react';
import './Meals.css';

function Meals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      console.log('Fetching meals...'); // Debug log
      
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch('http://localhost:5004/api/admin/meals', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch meals');
      }

      const data = await response.json();
      console.log('Fetched meals:', data); // Debug log
      setMeals(data);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    try {
      console.log('Deleting meal:', mealId); // Debug log
      
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/admin/meals/${mealId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete meal');
      }

      const data = await response.json();
      console.log('Delete response:', data); // Debug log
      
      // Remove the meal from state
      setMeals(prevMeals => prevMeals.filter(meal => meal._id !== mealId));
      alert('Meal deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete meal: ' + error.message);
    }
  };

  const handleEdit = (meal) => {
    console.log('Editing meal:', meal); // Debug log
    setEditingMeal({...meal}); // Create a copy of the meal
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating meal:', editingMeal); // Debug log
      
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/admin/meals/${editingMeal._id}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: editingMeal.name,
          description: editingMeal.description,
          price: parseFloat(editingMeal.price),
          image: editingMeal.image,
          category: editingMeal.category || 'main'
        })
      });

      const data = await response.json();
      console.log('Update response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update meal');
      }

      // Update the meals list with the edited meal
      setMeals(prevMeals => 
        prevMeals.map(meal => meal._id === editingMeal._id ? data : meal)
      );
      setEditingMeal(null);
      alert('Meal updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update meal: ' + error.message);
    }
  };

  if (loading) return <div className="loading">Loading meals...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="meals-container">
      <h2>Meals Management</h2>
      
      {editingMeal ? (
        <div className="edit-form">
          <h3>Edit Meal</h3>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editingMeal.name || ''}
                onChange={(e) => setEditingMeal(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={editingMeal.description || ''}
                onChange={(e) => setEditingMeal(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                value={editingMeal.price || ''}
                onChange={(e) => setEditingMeal(prev => ({
                  ...prev,
                  price: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Image URL:</label>
              <input
                type="text"
                value={editingMeal.image || ''}
                onChange={(e) => setEditingMeal(prev => ({
                  ...prev,
                  image: e.target.value
                }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Category:</label>
              <select
                value={editingMeal.category || 'main'}
                onChange={(e) => setEditingMeal(prev => ({
                  ...prev,
                  category: e.target.value
                }))}
                required
              >
                <option value="main">Main Course</option>
                <option value="starter">Starter</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">Save Changes</button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setEditingMeal(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="meals-grid">
          {meals.length === 0 ? (
            <div className="no-meals">No meals available</div>
          ) : (
            meals.map(meal => (
              <div key={meal._id} className="meal-card">
                <img src={meal.image} alt={meal.name} className="meal-image" />
                <div className="meal-content">
                  <h3>{meal.name}</h3>
                  <p>{meal.description}</p>
                  <p className="price">${parseFloat(meal.price).toFixed(2)}</p>
                  <div className="meal-actions">
                    <button 
                      onClick={() => handleEdit(meal)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(meal._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Meals; 