import React, { useState, useRef} from 'react';

export default function BusinessCard() {
  const [hovered, setHovered] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  


  
  // Track mouse position when hovering over the entire card
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    // Get container bounds
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to container center
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10; 
    
    setPosition({ x, y });
  };
  
  // Reset position when mouse leaves
  const handleMouseLeave = () => {
    setHovered(false);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-96 outline-2 bg-gradient-to-br from-slate-600 to-slate-900 shadow-lg shadow-slate-700 rounded-2xl overflow-hidden p-5 mx-auto flex flex-col items-center gap-3 transition-all duration-200 ease-out"
      style={{
        transform: hovered ? `perspective(1000px) rotateX(${-position.y}deg) rotateY(${position.x}deg) scale(1.05)` : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: 'transform 0.2s ease-out'
      }}
    >
      <div 
        onMouseOver={() => setImageHovered(true)} 
        onMouseLeave={() => setImageHovered(false)}  
        className="relative rounded-sm overflow-hidden transition-all duration-200 ease-in-out hover:shadow-lg shadow-slate-400 hover:ring-2 ring-slate-300"
      >
        {/* Carousel container */}
        <div className="w-full overflow-hidden">
          {/* Image strip that moves horizontally */}
          <div 
          >
            {/* Render all images side by side, including the clone */}
        <img src="https://cdn.britannica.com/93/258393-050-AF5EF297/conor-mcgregor-celebrates-first-round-knock-out-victory-over-jose-aldo-in-featherweight-title-ufc-194-2015.jpg" />
          </div>
          
          {/* Dark gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"></div>
          
          <div 
            className={`
              text-white absolute left-0 bottom-0 p-3 w-full
              transform transition-all duration-300 ease-in-out
              ${imageHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
            `}
          >
            <p className="text-white text-sm font-medium">Conor McGregor</p>
            <p className="text-white text-sm font-black">UFC</p>
            <div className='flex items-center justify-between'>
              <p className='text-xs'>Lightweight Champion</p>
              <p className='text-xs'>Record: 22-5-0</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-white my-3">
        <h2 className="text-xl font-black">Conor McGregor</h2>
        <p className="text-sm text-slate-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Deleniti libero omnis officiis fugit, quo at cum voluptatum, reiciendis odit rem? Dolorum sequi consequuntur recusandae.</p>
      </div>
      
    </div>
  );
}