
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from './constants';
import { Language } from './types';
import Hero from './components/Hero';
import StudentForm from './components/StudentForm';
import AdminDashboard from './components/AdminDashboard';
import { Globe, Moon, Sun } from 'lucide-react';

// Selected Images
const PAGE_BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1535868463750-c78d9543614f?q=80&w=2600"; // BG 16 (Texture)
const FORM_BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2600"; // FG 6 (Gradient)

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currentView, setCurrentView] = useState<'landing' | 'form' | 'admin'>('landing');
  
  // Update HTML dir and lang attributes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
    
    // Update font family based on language
    const fontFamily = lang === 'ar' ? "'Cairo', sans-serif" : 
                       lang === 'ku' ? "'Noto Sans Arabic', sans-serif" : 
                       "'Inter', sans-serif";
    document.body.style.fontFamily = fontFamily;
  }, [lang]);

  // Update Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = TRANSLATIONS[lang];

  const handleStart = () => setCurrentView('form');
  
  const handleAdminClick = () => {
    // Force English and lock it
    setLang('en');
    setCurrentView('admin');
  };
  
  const handleBackHome = () => setCurrentView('landing');

  return (
    <div 
      className={`min-h-screen flex flex-col ${lang === 'en' ? 'text-left' : 'text-right'} bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}
      style={{
        backgroundImage: `url("${PAGE_BACKGROUND_IMAGE}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundBlendMode: theme === 'dark' ? 'overlay' : 'normal'
      }}
    >
      {/* Overlay for Page Background legibility - Reduced Opacity to 80% to make bg more apparent */}
      <div className="min-h-screen flex flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-colors duration-200">
        
        {/* Navbar */}
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div 
                className="cursor-pointer flex items-center gap-2"
                onClick={handleBackHome}
              >
                <span className="text-2xl font-extrabold text-primary dark:text-blue-400 tracking-tight">Abroadify</span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Language Selector */}
                <div className={`flex items-center text-gray-600 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${currentView === 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Globe className="w-4 h-4 mx-2" />
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value as Language)}
                    disabled={currentView === 'admin'}
                    className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer outline-none dark:bg-gray-700 disabled:cursor-not-allowed"
                  >
                    <option value="ar">العربية</option>
                    <option value="ku">کوردی</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow">
          {currentView === 'landing' && (
            <Hero lang={lang} t={t} onStart={handleStart} />
          )}
          
          {currentView === 'form' && (
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
              <button 
                  onClick={handleBackHome}
                  className="mb-6 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                {lang === 'en' ? '←' : '→'} {t.backToHome}
              </button>
              <StudentForm 
                lang={lang} 
                t={t} 
                onSuccess={handleBackHome} 
                backgroundImage={FORM_BACKGROUND_IMAGE} 
              />
            </div>
          )}

          {currentView === 'admin' && (
            <AdminDashboard lang={lang} t={t} onBack={handleBackHome} />
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 dark:bg-black text-white py-8 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="mb-4 text-gray-400">
              © 2025 Abroadify. All rights reserved.
            </p>
            <button 
              onClick={handleAdminClick} 
              className="text-xs text-gray-600 dark:text-gray-500 hover:text-gray-400 transition-colors"
            >
              {t.adminButton}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
