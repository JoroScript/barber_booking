import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import components
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import HomePage from './components/HomePage/HomePage';
import BookingPage from './components/BookingPage/BookingPage';
import LoginPage from './components/LoginPage/LoginPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import AdminPage from './components/AdminPage/AdminPage';
import UserPage from './components/UserPage/UserPage';
import NotFoundPage from './components/NotFoundPage/NotFoundPage';
import { BookingProvider } from './contexts/BookingContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import the standalone calendar component
import CalendarComponent from './CalendarComponent';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">We're sorry, but there was an error loading this page.</p>
          {this.state.error && (
            <div className="bg-gray-800 p-4 rounded mb-4 max-w-2xl overflow-auto">
              <p className="font-bold">Error:</p>
              <p className="text-red-400">{this.state.error.toString()}</p>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-amber-500 text-black rounded hover:bg-amber-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }
  
  return isAuthenticated && user?.role === 'admin' ? children : <Navigate to="/" />;
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if React is loaded
    if (window.isReactLoaded && window.isReactLoaded()) {
      console.log('React is loaded in App component');
      setIsLoaded(true);
    } else {
      console.error('React is not loaded in App component');
      // Try to load React again
      import('./react-loader.js')
        .then(() => {
          if (window.isReactLoaded && window.isReactLoaded()) {
            console.log('React is now loaded in App component');
            setIsLoaded(true);
          } else {
            console.error('React is still not loaded in App component');
          }
        })
        .catch(error => {
          console.error('Error loading React loader in App component:', error);
        });
    }
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/calendar" element={<CalendarComponent />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          <ToastContainer position="bottom-right" />
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
