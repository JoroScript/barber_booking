// HeroComponent.jsx
import { Link } from 'react-router-dom';
import React from 'react';

const HeroComponent = () => {
  return (
    <div className="relative w-full h-screen">
    <div 
      className="absolute inset-0 bg-cover bg-center w-full h-full"
      style={{ backgroundImage: `url("https://images.unsplash.com/photo-1592647420148-bfcc177e2117")` }}
    >
      <div className="absolute inset-0  bg-opacity-40"></div>
    </div>
    
    {/* Text Content */}
    <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
        TheBorzz Barbershop
      </h1>
      <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl">
        Освежи Визията Си
      </p>
      <Link to="/booking" className="px-6 py-3 text-white font-medium rounded-lg transition-colors duration-300">
        Запази Час
      </Link>
    </div>
  </div>
  );
};

export default HeroComponent;