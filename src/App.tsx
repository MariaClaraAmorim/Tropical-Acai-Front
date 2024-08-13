import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Home from './components/Home';
import Orders from './components/Orders';
import Catalog from './components/ProductList';
import AdminOrders from './components/AdminOrder';
import RegisterUser from './components/RegisterUser';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('loggedIn'));
  const [userType, setUserType] = useState<string | null>(localStorage.getItem('userType'));
  const [clientId, setClientId] = useState<string | null>(localStorage.getItem('clientId'));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem('loggedIn'));
      setUserType(localStorage.getItem('userType'));
      setClientId(localStorage.getItem('clientId'));
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('clientId');
    setIsLoggedIn(false);
    setUserType(null);
    setClientId(null);
  };

  return (
    <Router>
      <CartProvider>
        <div className="App">
          {isLoggedIn && <Header handleLogout={handleLogout} />}
          <Routes>
            {!isLoggedIn ? (
              <>
                <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} setUserType={setUserType} setClientId={setClientId} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to={userType === 'ADMIN' ? '/admin' : '/home'} />} />
                <Route element={<ProtectedRoute isAdmin={true} />}>
                  <Route path="/admin" element={<Home />} />
                 {/*  <Route path="/catalog" element={<Catalog />} /> */}
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/settings" element={<RegisterUser />} />

                </Route>
                <Route element={<ProtectedRoute isAdmin={false} />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/orders" element={<Orders />} />
                </Route>
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
};

export default App;
