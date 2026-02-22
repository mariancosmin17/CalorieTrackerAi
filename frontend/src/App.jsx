import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import { useState } from 'react';
import {useAuth} from './context/AuthContext';
import {LoginPage} from './pages/auth/LoginPage';
import {RegisterPage} from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { BottomNavbar } from './components/layout/BottomNavbar';
import { CaloriesTab } from './components/features/dashboard/CaloriesTab';
import { NutrientsTab } from './components/features/dashboard/NutrientsTab';



function ProtectedRoute({children}){
    const {isLoggedIn,isLoading}=useAuth();
    if(isLoading){
        return null;
        }
    if(!isLoggedIn){
        return <Navigate to="/login" replace />
        }
    return children;
}

function PublicRoute({children}){
  const {isLoggedIn,isLoading}=useAuth();
  if(isLoading) {
    return null;
  }
   if(isLoggedIn) {
    return <Navigate to="/dashboard" replace />;
  }
   return children;
}

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomeRedirect />}
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

function HomeRedirect(){
  const {isLoggedIn}=useAuth();
  return <Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />;
}

function NotFoundPage() {
  return (
    <div className="page-container">
      <div className="card max-w-md text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <a href="/" className="btn-primary inline-block">
          Go Home
        </a>
      </div>
    </div>
  );
}

export default App;