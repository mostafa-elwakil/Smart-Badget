import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import ShoppingList from './pages/ShoppingList';
import MonthlySummary from './pages/MonthlySummary';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import UserManagement from './pages/UserManagement';
import Categories from './pages/Categories';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import { CurrencyProvider } from './context/CurrencyContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyEmail />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="income" element={<Income />} />
                <Route path="shopping" element={<ShoppingList />} />
                <Route path="summary" element={<MonthlySummary />} />
                <Route path="categories" element={<Categories />} />
                <Route path="users" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="admin" element={<AdminRoute><UserManagement /></AdminRoute>} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </CurrencyProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
