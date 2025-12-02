
import React, { useState, useEffect } from 'react';
import { Translation, Language } from '../types';

interface HeroProps {
  lang: Language;
  t: Translation;
  onStart: () => void;
}

const HERO_IMAGES = [
  // 1. Classic European University (Aspirational)
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop",
  // 2. European City / Lifestyle (The Journey)
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=2070&auto=format&fit=crop",
  // 3. Modern Student / Graduation (Success)
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
];

const Hero: React.FC<HeroProps> = ({ t, onStart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in font-sans">
      {/* Hero Header */}
      <div className="relative bg-primary dark:bg-blue-900 text-white overflow-hidden transition-colors duration-200 h-[600px] md:h-[700px] flex items-center justify-center">
        
        {/* Background Slider */}
        {HERO_IMAGES.map((img, index) => (
          <div 
            key={img}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out ${
              index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{ backgroundImage: `url("${img}")` }}
          ></div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10"></div>
        
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-10">
          {/* Logo with Spotlight Glow */}
          <div className="mb-10 animate-[fadeIn_1.5s_ease-out] relative inline-block">
            {/* Soft White Glow Behind Logo */}
            <div className="absolute inset-0 bg-white/30 blur-3xl rounded-full transform scale-110"></div>
            
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/abroadify-8a886.firebasestorage.app/o/Gemini_Generated_Image_uy5zhcuy5zhcuy5z-removebg-preview.png?alt=media&token=5a4073aa-fbb5-472b-aaaf-0db7225c1451"
              alt="Abroadify Logo"
              className="relative z-10 h-48 md:h-60 mx-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
            />
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-xl leading-tight">
            {t.title}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 text-gray-100 drop-shadow-lg font-medium leading-relaxed">
            {t.subtitle}
          </p>
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-gray-900 transition-all duration-200 bg-secondary font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary hover:bg-yellow-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,204,0,0.5)]"
          >
            {t.cta}
            <div className="absolute -inset-3 rounded-xl bg-secondary opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-200" />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 dark:text-white mb-20 relative">
             <span className="relative z-10">{t.featuresTitle}</span>
             <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-primary dark:bg-blue-500 rounded-full -mb-4"></span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Consultancy */}
            <div className="relative group h-96 rounded-3xl overflow-hidden shadow-xl cursor-default bg-black">
               {/* Blurred Background Image */}
               <div 
                 className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out filter blur-[5px] group-hover:blur-0 opacity-80 group-hover:opacity-100 transform scale-110 group-hover:scale-100"
                 style={{ backgroundImage: `url("https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop")` }}
               ></div>
               
               {/* Dark Overlay - Becomes darker on hover for text readability */}
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/80 transition-colors duration-500"></div>

               {/* Content */}
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                 <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md transform transition-transform duration-500 group-hover:-translate-y-4">
                    {t.feature1}
                 </h3>
                 <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-700 ease-in-out">
                    <p className="text-gray-100 text-lg leading-relaxed drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {t.feature1Desc}
                    </p>
                 </div>
               </div>
            </div>

            {/* Feature 2: Visa Support */}
            <div className="relative group h-96 rounded-3xl overflow-hidden shadow-xl cursor-default bg-black">
               {/* Blurred Background Image */}
               <div 
                 className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out filter blur-[5px] group-hover:blur-0 opacity-80 group-hover:opacity-100 transform scale-110 group-hover:scale-100"
                 style={{ backgroundImage: `url("https://images.unsplash.com/photo-1569974498991-d3c12a504f95?q=80&w=800&auto=format&fit=crop")` }}
               ></div>
               
               {/* Dark Overlay - Becomes darker on hover for text readability */}
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/80 transition-colors duration-500"></div>

               {/* Content */}
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                 <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md transform transition-transform duration-500 group-hover:-translate-y-4">
                    {t.feature2}
                 </h3>
                 <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-700 ease-in-out">
                    <p className="text-gray-100 text-lg leading-relaxed drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {t.feature2Desc}
                    </p>
                 </div>
               </div>
            </div>

            {/* Feature 3: Partnerships */}
            <div className="relative group h-96 rounded-3xl overflow-hidden shadow-xl cursor-default bg-black">
               {/* Blurred Background Image */}
               <div 
                 className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out filter blur-[5px] group-hover:blur-0 opacity-80 group-hover:opacity-100 transform scale-110 group-hover:scale-100"
                 style={{ backgroundImage: `url("https://www.opsisarch.com/wp-content/uploads//2020/05/University-of-Oregon-Straub-Hall-Lecture-Opsis-Architecture.jpg")` }}
               ></div>
               
               {/* Dark Overlay - Becomes darker on hover for text readability */}
               <div className="absolute inset-0 bg-black/40 group-hover:bg-black/80 transition-colors duration-500"></div>

               {/* Content */}
               <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-10">
                 <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md transform transition-transform duration-500 group-hover:-translate-y-4">
                    {t.feature3}
                 </h3>
                 <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-700 ease-in-out">
                    <p className="text-gray-100 text-lg leading-relaxed drop-shadow-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        {t.feature3Desc}
                    </p>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
