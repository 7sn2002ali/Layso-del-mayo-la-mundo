
import React, { useState } from 'react';
import { Translation, Language, StudentSubmission } from '../types';
import { submitApplication } from '../firebase';
import { Trash2, CheckCircle } from 'lucide-react';

interface StudentFormProps {
  lang: Language;
  t: Translation;
  onSuccess: () => void;
  backgroundImage?: string;
}

const StudentForm: React.FC<StudentFormProps> = ({ lang, t, onSuccess, backgroundImage }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [educationObtained, setEducationObtained] = useState<StudentSubmission['educationObtained']>('secondary');
  const [educationSection, setEducationSection] = useState('');
  const [grade, setGrade] = useState('');
  const [educationWanted, setEducationWanted] = useState<StudentSubmission['educationWanted']>('bachelors');
  const [desiredMajor, setDesiredMajor] = useState('');
  const [countries, setCountries] = useState<string[]>(['', '', '']); // Start with 3 empty slots
  const [englishProficiency, setEnglishProficiency] = useState<number>(5);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCountryChange = (index: number, value: string) => {
    const newCountries = [...countries];
    newCountries[index] = value;
    setCountries(newCountries);
  };

  const addCountry = () => {
    setCountries([...countries, '']);
  };

  const removeCountry = (index: number) => {
    if (countries.length > 1) {
      const newCountries = countries.filter((_, i) => i !== index);
      setCountries(newCountries);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Only allow numbers and max 11 chars
    if (/^\d*$/.test(val) && val.length <= 11) {
      setPhoneNumber(val);
    }
  };

  const generateRFC = () => {
    // Generate a random 6-digit number prefixed with RFC
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `RFC-${randomNum}`;
  };

  const getProficiencyLabel = (val: number) => {
    if (val <= 2) return t.englishProficiencyLevels.beginner;
    if (val <= 4) return t.englishProficiencyLevels.elementary;
    if (val <= 6) return t.englishProficiencyLevels.intermediate;
    if (val <= 8) return t.englishProficiencyLevels.advanced;
    if (val === 9) return t.englishProficiencyLevels.fluent;
    return t.englishProficiencyLevels.native;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Filter out empty countries
    const validCountries = countries.filter(c => c.trim() !== '');

    if (validCountries.length < 1) {
      setError(t.minCountriesError);
      return;
    }

    if (phoneNumber.length !== 11) {
      setError(t.phoneError);
      return;
    }
    
    if (!fullName || !governorate || !phoneNumber) {
        setError(t.requiredError);
        return;
    }

    setIsSubmitting(true);

    const submission: StudentSubmission = {
      rfcNumber: generateRFC(),
      status: 'new', // Default status
      fullName,
      governorate,
      educationObtained,
      educationSection,
      grade,
      educationWanted,
      desiredMajor,
      targetCountries: validCountries,
      englishProficiency,
      phoneNumber,
      timestamp: Date.now()
    };

    try {
      await submitApplication(submission);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 5000); // Give user time to read the message
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl text-center animate-fade-in transition-colors duration-200">
        <div className="flex justify-center mb-6 text-green-500">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t.successMessage}</h2>
      </div>
    );
  }

  // Base input classes: bg-white for light mode (requested), bg-gray-700 for dark mode
  const inputClasses = "w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white text-gray-900 dark:bg-gray-700 dark:text-white";
  const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 relative z-10";

  // Determine Gradient Direction based on Language (RTL vs LTR)
  const isRTL = lang === 'ar' || lang === 'ku';
  const gradientDir = isRTL ? 'to left' : 'to right';

  return (
    <div 
      className="relative p-8 rounded-2xl shadow-xl transition-all duration-500 overflow-hidden bg-white dark:bg-gray-800"
      style={{
        backgroundImage: backgroundImage ? `url("${backgroundImage}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay to ensure readability - Reduced opacity to 80% to make background more apparent */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-0 transition-colors duration-500"></div>
      )}

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-primary dark:text-blue-400 mb-8 text-center">{t.formTitle}</h2>
        
        {/* Custom Styles for Slider Thumb */}
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            margin-top: -8px; /* Alignment adjustment */
            cursor: pointer;
          }
          input[type=range]::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #ffffff;
            border: 2px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
          }
          input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 8px;
            border-radius: 999px;
            cursor: pointer;
          }
        `}</style>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* 1. Name */}
          <div>
            <label className={labelClasses}>{t.nameLabel} *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* 2. Governorate */}
          <div>
            <label className={labelClasses}>{t.govLabel} *</label>
            <select
              required
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className={inputClasses}
            >
              <option value="">{t.selectOption}</option>
              {t.governorates.map((gov) => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          {/* 3. Level of Education Obtained */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t.eduObtainedLabel} *</label>
              <select
                required
                value={educationObtained}
                onChange={(e) => setEducationObtained(e.target.value as any)}
                className={inputClasses}
              >
                <option value="secondary">{t.eduOptions.secondary}</option>
                <option value="bachelors">{t.eduOptions.bachelors}</option>
                <option value="masters">{t.eduOptions.masters}</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>{t.eduSectionLabel} *</label>
              <input
                type="text"
                required
                value={educationSection}
                onChange={(e) => setEducationSection(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* 3.2 Grade */}
          <div>
            <label className={labelClasses}>{t.gradeLabel}</label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* 4. Level of Education Wanted */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>{t.eduWantedLabel} *</label>
              <select
                required
                value={educationWanted}
                onChange={(e) => setEducationWanted(e.target.value as any)}
                className={inputClasses}
              >
                <option value="bachelors">{t.eduOptions.bachelors}</option>
                <option value="masters">{t.eduOptions.masters}</option>
                <option value="phd">{t.eduOptions.phd}</option>
              </select>
            </div>
             {/* New Field: Desired Major */}
            <div>
              <label className={labelClasses}>{t.desiredMajorLabel} *</label>
              <input
                type="text"
                required
                value={desiredMajor}
                onChange={(e) => setDesiredMajor(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>

          {/* 5. Countries */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors duration-200 relative">
            <label className={labelClasses}>{t.countriesLabel} *</label>
            <div className="space-y-3 relative z-10">
              {countries.map((country, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => handleCountryChange(index, e.target.value)}
                    placeholder={`${t.countryPlaceholder} ${index + 1}`}
                    className={inputClasses}
                  />
                  {countries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCountry(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCountry}
              className="mt-4 text-sm text-primary dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline relative z-10"
            >
              {t.addCountry}
            </button>
          </div>

          {/* 6. English Proficiency */}
          <div>
            <label className={`${labelClasses} flex justify-between items-end`}>
              <span>{t.englishLabel}</span>
              <span className="text-primary dark:text-blue-400 font-bold text-lg">
                 {englishProficiency} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({getProficiencyLabel(englishProficiency)})</span>
              </span>
            </label>
            
            <div className="relative w-full h-8 flex items-center">
               {/* Gradient Background */}
               <div 
                 className="absolute inset-x-0 h-2 rounded-full"
                 style={{ background: `linear-gradient(${gradientDir}, #ef4444, #eab308, #22c55e)` }}
               ></div>

               {/* Visual Nodes */}
               <div className="absolute inset-x-0 h-2 flex justify-between items-center px-1 pointer-events-none">
                  {Array.from({length: 10}).map((_, i) => (
                     <div key={i} className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                  ))}
               </div>

               {/* Input */}
               <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={englishProficiency}
                  onChange={(e) => setEnglishProficiency(parseInt(e.target.value))}
                  className="w-full absolute z-10 appearance-none bg-transparent"
               />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1 px-1 relative z-10">
              <span>1</span>
              <span>10</span>
            </div>
          </div>

          {/* 7. Phone Number */}
          <div>
            <label className={labelClasses}>{t.phoneLabel} *</label>
            <div className="relative">
               <input
                type="tel"
                required
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`${inputClasses} text-left`}
                dir="ltr" 
                placeholder={t.phonePlaceholder}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-primary dark:bg-blue-600 text-white font-bold py-4 rounded-xl text-lg shadow-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-all transform active:scale-95 relative z-10 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
