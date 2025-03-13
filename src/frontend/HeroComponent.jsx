// HeroComponent.jsx
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import "./styles/animations.css";
import hatchetImage from './assets/hatchet.png'; // Import the hatchet image

const HeroComponent = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const animationFrameRef = useRef(null);
  const throttleRef = useRef(false);

  useEffect(() => {
    // Preload the hatchet image
    const img = new Image();
    img.src = hatchetImage;
    img.onload = () => {
      setImagesLoaded(true);
      // Trigger animations after component mounts and image loads
      setTimeout(() => {
        setIsLoaded(true);
      }, 300);
    };
    
    // Track mouse movement for parallax effect with throttling
    const handleMouseMove = (e) => {
      if (throttleRef.current) return;
      
      throttleRef.current = true;
      
      // Use requestAnimationFrame for smoother performance
      animationFrameRef.current = requestAnimationFrame(() => {
        setMousePosition({
          x: e.clientX / window.innerWidth - 0.5,
          y: e.clientY / window.innerHeight - 0.5
        });
        
        setTimeout(() => {
          throttleRef.current = false;
        }, 16); // Throttle to ~60fps
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Memoize the hatchet elements to prevent unnecessary re-renders
  const renderHatchets = () => {
    if (!imagesLoaded) return null;
    
    return (
      <>
        {/* Main large hatchet */}
        <div 
          className={`absolute w-64 h-64 transition-all duration-1000 ease-out ${
            isLoaded ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{
            top: `calc(15% + ${mousePosition.y * -20}px)`,
            right: `calc(10% + ${mousePosition.x * -20}px)`,
            transformOrigin: 'center center',
            animation: 'floatAndSpin 15s ease-in-out infinite',
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
            willChange: 'transform'
          }}
        >
          <img 
            src={hatchetImage} 
            alt="Hatchet" 
            className="w-full h-full object-contain"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        
        {/* Medium hatchet with swing animation */}
        <div 
          className={`absolute w-56 h-56 transition-all duration-1000 delay-300 ease-out ${
            isLoaded ? 'opacity-80 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{
            bottom: `calc(20% + ${mousePosition.y * 20}px)`,
            left: `calc(10% + ${mousePosition.x * 20}px)`,
            transformOrigin: 'center center',
            animation: 'swingAndFloat 12s ease-in-out infinite',
            filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))',
            willChange: 'transform'
          }}
        >
          <img 
            src={hatchetImage} 
            alt="Hatchet" 
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
        
        {/* Small hatchet with spin animation */}
        <div 
          className={`absolute w-40 h-40 transition-all duration-1000 delay-500 ease-out ${
            isLoaded ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
          style={{
            top: `calc(30% + ${mousePosition.y * -15}px)`,
            left: `calc(25% + ${mousePosition.x * -15}px)`,
            transformOrigin: 'center center',
            animation: 'floatAndSpin 10s ease-in-out infinite reverse',
            filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.3))',
            willChange: 'transform'
          }}
        >
          <img 
            src={hatchetImage} 
            alt="Hatchet" 
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
        
        {/* Extra small floating hatchets with physics - just a few */}
        {[...Array(3)].map((_, index) => {
          // Randomize animation type
          const animationType = index % 3 === 0 
            ? 'floatAndSpin' 
            : index % 3 === 1 
              ? 'swingAndFloat' 
              : 'float';
          
          // Randomize duration
          const duration = 6 + (index % 5) * 2;
          
          // Randomize delay
          const delay = (index % 10) * 0.5;
          
          // Randomize position - spread them out
          const topPos = 10 + (index % 5) * 15;
          const leftPos = 15 + (index % 5) * 15;
          
          // Randomize size - smaller
          const size = 24 + (index % 3) * 8;
          
          return (
            <div 
              key={index}
              className={`absolute transition-all duration-1000 ease-out ${
                isLoaded ? 'opacity-50 translate-y-0' : 'opacity-0 translate-y-20'
              }`}
              style={{
                top: `${topPos}%`,
                left: `${leftPos}%`,
                width: `${size}px`,
                height: `${size}px`,
                transformOrigin: 'center center',
                animation: `${animationType} ${duration}s ease-in-out infinite ${index % 2 ? 'reverse' : ''}`,
                animationDelay: `${delay}s`,
                filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.2))',
                willChange: 'transform'
              }}
            >
              <img 
                src={hatchetImage} 
                alt="Hatchet" 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </div>
          );
        })}
      </>
    );
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Dark background with gradient for contrast with white hatchet */}
      <div 
        className={`absolute inset-0  transition-opacity duration-1000 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundPosition: `${50 + mousePosition.x * 10}% ${50 + mousePosition.y * 10}%`
        }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-full h-full bg-grid-pattern"></div>
        </div>
      </div>
      
      {/* Animated hatchets container */}
      <div className="absolute inset-0 overflow-hidden">
        {renderHatchets()}
      </div>
      
      {/* Text Content with staggered animations */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 
          className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 transition-all duration-1000 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            transform: `translateX(${mousePosition.x * -10}px) translateY(${mousePosition.y * -10}px)`
          }}
        >
          <span className="inline-block overflow-hidden">
            <span className="inline-block animate-wave">T</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.1s' }}>h</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.2s' }}>e</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.3s' }}>B</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.4s' }}>o</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.5s' }}>r</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.6s' }}>z</span>
            <span className="inline-block animate-wave" style={{ animationDelay: '0.7s' }}>z</span>
          </span>
          <span className="block mt-2 text-gradient">Barbershop</span>
        </h1>
        
        <p 
          className={`text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl transition-all duration-1000 delay-300 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            transform: `translateX(${mousePosition.x * -5}px) translateY(${mousePosition.y * -5}px)`
          }}
        >
          Освежи Визията Си
        </p>
        
        {/* Animated button */}
        <div 
          className={`transition-all duration-1000 delay-600 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transform: `translateX(${mousePosition.x * -3}px) translateY(${mousePosition.y * -3}px)`
          }}
        >
          <Link 
            to="/booking" 
            className="relative inline-block px-8 py-4 text-white font-medium rounded-lg overflow-hidden group"
          >
            {/* Button background with hover effect */}
            <span 
              className={`absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 transition-all duration-500 ease-out ${
                isHovered ? 'opacity-100' : 'opacity-90'
              }`}
            ></span>
            
            {/* Animated border */}
            <span className="absolute inset-0 border border-amber-500 opacity-30 rounded-lg"></span>
            
            {/* Shine effect */}
            <span 
              className={`absolute inset-0 transform transition-transform duration-700 ease-in-out ${
                isHovered ? 'translate-x-full' : '-translate-x-full'
              }`}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                top: 0,
                left: '-100%',
                width: '300%',
                height: '100%'
              }}
            ></span>
            
            {/* Button text */}
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
              Запази Час
              <span className="inline-block ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </Link>
        </div>
        
        {/* Animated scroll indicator */}
        <div 
          className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 transition-all duration-1000 delay-1000 ${
            isLoaded ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
        </div>
      </div>
    </div>
  );
};

export default HeroComponent;