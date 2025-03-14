import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple components for testing
const Navbar = () => (
  <header className="bg-gray-900 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="text-xl font-bold">Barber Shop</h1>
      <nav>
        <ul className="flex space-x-4">
          <li><a href="/" className="hover:text-amber-500">Home</a></li>
          <li><a href="/booking" className="hover:text-amber-500">Book Now</a></li>
        </ul>
      </nav>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white p-4 mt-auto">
    <div className="container mx-auto text-center">
      <p>© 2023 Barber Shop. All rights reserved.</p>
    </div>
  </footer>
);

const HomePage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-6">Welcome to our Barber Shop</h1>
    <p className="mb-4">We provide the best haircuts and beard trims in town.</p>
    <a 
      href="/booking" 
      className="inline-block bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-600 transition-colors"
    >
      Book an Appointment
    </a>
  </div>
);

const BookingPage = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
    <p className="mb-4">Please use our calendar to book your appointment.</p>
    <a 
      href="/calendar" 
      className="inline-block bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-600 transition-colors"
    >
      Open Calendar
    </a>
  </div>
);

const CalendarComponent = () => (
  <div className="container mx-auto p-4">
    <h1 className="text-3xl font-bold mb-6">Calendar</h1>
    <p>This is a placeholder for the calendar component.</p>
    <div className="mt-4">
      <a 
        href="/booking" 
        className="inline-block bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors mr-4"
      >
        Back
      </a>
    </div>
  </div>
);

const LoginPage = () => (
  <div className="container mx-auto p-4 max-w-md">
    <h1 className="text-3xl font-bold mb-6">Login</h1>
    <form className="space-y-4">
      <div>
        <label className="block mb-1">Email</label>
        <input type="email" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Password</label>
        <input type="password" className="w-full p-2 border rounded" />
      </div>
      <button 
        type="submit" 
        className="w-full bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-600 transition-colors"
      >
        Login
      </button>
    </form>
  </div>
);

const RegisterPage = () => (
  <div className="container mx-auto p-4 max-w-md">
    <h1 className="text-3xl font-bold mb-6">Register</h1>
    <form className="space-y-4">
      <div>
        <label className="block mb-1">Name</label>
        <input type="text" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Email</label>
        <input type="email" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1">Password</label>
        <input type="password" className="w-full p-2 border rounded" />
      </div>
      <button 
        type="submit" 
        className="w-full bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-600 transition-colors"
      >
        Register
      </button>
    </form>
  </div>
);

const NotFoundPage = () => (
  <div className="container mx-auto p-4 text-center">
    <h1 className="text-3xl font-bold mb-6">404 - Page Not Found</h1>
    <p className="mb-4">The page you are looking for does not exist.</p>
    <a 
      href="/" 
      className="inline-block bg-amber-500 text-black px-6 py-2 rounded hover:bg-amber-600 transition-colors"
    >
      Go Home
    </a>
  </div>
);

// Simple context providers
const AuthContext = React.createContext();
const useAuth = () => React.useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const BookingContext = React.createContext();
const BookingProvider = ({ children }) => {
  return (
    <BookingContext.Provider value={{}}>
      {children}
    </BookingContext.Provider>
  );
};

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

// Simple toast container
const ToastContainer = () => <div id="toast-container" className="fixed bottom-4 right-4"></div>;

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

  // Simple ReactProvider component
  const ReactProvider = ({ children }) => {
    return <>{children}</>;
  };

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
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
          <ToastContainer />
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
