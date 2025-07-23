import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>FitFuel Admin</h2>
      </div>
      <nav>
        <ul>
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/meals">Meals</Link></li>
          <li><Link to="/meal-plans">Meal Plans</Link></li>
          <li><Link to="/orders">Orders</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar; 