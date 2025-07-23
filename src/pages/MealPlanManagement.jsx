import React, { useState, useEffect } from 'react';
import MealPlanForm from '../components/MealPlanForm/MealPlanForm';
import './MealPlanManagement.css';

function MealPlanManagement() {
  const [mealPlans, setMealPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch('http://localhost:5004/api/meal-plans', {
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
      setMealPlans(data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAddMealPlan = async (mealPlanData) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch('http://localhost:5004/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(mealPlanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add meal plan');
      }
      
      await fetchMealPlans();
      setShowForm(false);
    } catch (err) {
      console.error('Error adding meal plan:', err);
      throw err;
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          throw new Error('Admin authentication token missing');
        }
        
        const response = await fetch(`http://localhost:5004/api/meal-plans/${planId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete meal plan');
        }

        await fetchMealPlans();
      } catch (err) {
        console.error('Error deleting meal plan:', err);
        alert('Failed to delete meal plan');
      }
    }
  };

  const handleUpdatePlan = async (mealPlanData) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        throw new Error('Admin authentication token missing');
      }
      
      const response = await fetch(`http://localhost:5004/api/meal-plans/${editingPlan._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(mealPlanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update meal plan');
      }
      
      await fetchMealPlans();
      setShowForm(false);
      setEditingPlan(null);
    } catch (err) {
      console.error('Error updating meal plan:', err);
      throw err;
    }
  };

  if (loading) return <div className="loading">Loading meal plans...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="meal-plan-management">
      <div className="header">
        <h1>Meal Plan Management</h1>
        <button 
          className="add-btn"
          onClick={() => {
            setShowForm(!showForm);
            setEditingPlan(null);
          }}
        >
          {showForm ? 'Cancel' : 'Add New Meal Plan'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <h2>{editingPlan ? 'Edit Meal Plan' : 'Add New Meal Plan'}</h2>
          <MealPlanForm 
            onSubmit={editingPlan ? handleUpdatePlan : handleAddMealPlan}
            initialData={editingPlan}
          />
        </div>
      )}

      <div className="meal-plans-list">
        <h2>Current Meal Plans</h2>
        <div className="meal-plans-grid">
          {mealPlans.length === 0 ? (
            <p>No meal plans available</p>
          ) : (
            mealPlans.map(plan => (
              <div key={plan._id} className="meal-plan-card">
                <img src={plan.image} alt={plan.name} />
                <div className="plan-info">
                  <h3>{plan.name}</h3>
                  <p className="duration">{plan.duration} Days</p>
                  <p className="price">${plan.price}</p>
                  <p className="type">{plan.type}</p>
                  <div className="plan-actions">
                    <button onClick={() => handleEditPlan(plan)}>Edit</button>
                    <button onClick={() => handleDeletePlan(plan._id)}>Delete</button>
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

export default MealPlanManagement; 