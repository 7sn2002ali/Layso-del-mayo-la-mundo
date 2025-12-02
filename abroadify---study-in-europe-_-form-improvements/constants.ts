
import { Translation, Language } from './types';

// Master list of governorates with translations for lookup/translation purposes
export const GOVERNORATE_DATA = [
  { id: 'anbar', en: 'Anbar', ar: 'الأنبار', ku: 'ئەنبار' },
  { id: 'babil', en: 'Babil', ar: 'بابل', ku: 'بابل' },
  { id: 'baghdad', en: 'Baghdad', ar: 'بغداد', ku: 'بەغدا' },
  { id: 'basra', en: 'Basra', ar: 'البصرة', ku: 'بەسرە' },
  { id: 'dhiqar', en: 'Dhi Qar', ar: 'ذي قار', ku: 'زی قار' },
  { id: 'diwaniyah', en: 'Diwaniyah', ar: 'الديوانية', ku: 'دیوانیە' },
  { id: 'diyala', en: 'Diyala', ar: 'ديالى', ku: 'دیالە' },
  { id: 'duhok', en: 'Duhok', ar: 'دهوك', ku: 'دهۆک' },
  { id: 'erbil', en: 'Erbil', ar: 'أربيل', ku: 'هەولێر' },
  { id: 'halabja', en: 'Halabja', ar: 'حلبجة', ku: 'هەڵەبجە' },
  { id: 'karbala', en: 'Karbala', ar: 'كربلاء', ku: 'کەربەلا' },
  { id: 'kirkuk', en: 'Kirkuk', ar: 'كركوك', ku: 'کەرکوک' },
  { id: 'maysan', en: 'Maysan', ar: 'ميسان', ku: 'میسان' },
  { id: 'muthanna', en: 'Muthanna', ar: 'المثنى', ku: 'موسەننا' },
  { id: 'najaf', en: 'Najaf', ar: 'النجف', ku: 'نەجەف' },
  { id: 'nineveh', en: 'Nineveh', ar: 'نينوى', ku: 'نەینەوا' },
  { id: 'saladin', en: 'Saladin', ar: 'صلاح الدين', ku: 'سەڵاحەدین' },
  { id: 'sulaymaniyah', en: 'Sulaymaniyah', ar: 'السليمانية', ku: 'سلێمانی' },
  { id: 'wasit', en: 'Wasit', ar: 'واسط', ku: 'واست' }
];

// Common Countries for Translation Lookup
export const COUNTRIES_DATA = [
    { id: 'germany', en: 'Germany', ar: 'ألمانيا', ku: 'ئەڵمانیا' },
    { id: 'france', en: 'France', ar: 'فرنسا', ku: 'فەرەنسا' },
    { id: 'uk', en: 'UK', ar: 'بريطانيا', ku: 'بەریتانیا' },
    { id: 'uk_full', en: 'United Kingdom', ar: 'المملكة المتحدة', ku: 'شانشینی یەکگرتوو' },
    { id: 'usa', en: 'USA', ar: 'أمريكا', ku: 'ئەمریکا' },
    { id: 'sweden', en: 'Sweden', ar: 'السويد', ku: 'سوید' },
    { id: 'italy', en: 'Italy', ar: 'إيطاليا', ku: 'ئیتاڵیا' },
    { id: 'spain', en: 'Spain', ar: 'إسبانيا', ku: 'ئیسپانیا' },
    { id: 'netherlands', en: 'Netherlands', ar: 'هولندا', ku: 'هۆڵەندا' },
    { id: 'norway', en: 'Norway', ar: 'النرويج', ku: 'نەرویج' },
    { id: 'finland', en: 'Finland', ar: 'فنلندا', ku: 'فینلاند' },
    { id: 'poland', en: 'Poland', ar: 'بولندا', ku: 'پۆڵەندا' },
    { id: 'hungary', en: 'Hungary', ar: 'هنغاريا', ku: 'هەنگاریا' },
    { id: 'austria', en: 'Austria', ar: 'النمسا', ku: 'نەمسا' },
    { id: 'belgium', en: 'Belgium', ar: 'بلجيكا', ku: 'بەلجیکا' },
    { id: 'switzerland', en: 'Switzerland', ar: 'سويسرا', ku: 'سویسرا' },
    { id: 'canada', en: 'Canada', ar: 'كندا', ku: 'کەنەدا' },
    { id: 'russia', en: 'Russia', ar: 'روسيا', ku: 'ڕووسیا' },
    { id: 'estonia', en: 'Estonia', ar: 'إستونيا', ku: 'ئێستۆنیا' },
    { id: 'ireland', en: 'Ireland', ar: 'ايرلندا', ku: 'ئیرلەندا' },
    { id: 'greece', en: 'Greece', ar: 'اليونان', ku: 'یۆنان' },
    { id: 'portugal', en: 'Portugal', ar: 'البرتغال', ku: 'پورتوگال' },
];

// Common Majors/Departments for Translation Lookup
export const MAJORS_DATA = [
    { id: 'cs', en: 'Computer Science', ar: 'علوم حاسوب', ku: 'زانستی کۆمپیوتەر' },
    { id: 'se', en: 'Software Engineering', ar: 'هندسة برمجيات', ku: 'ئەندازیاری سۆفتوێر' },
    { id: 'it', en: 'IT', ar: 'تكنولوجيا معلومات', ku: 'تەکنەلۆژیای زانیاری' },
    { id: 'civil', en: 'Civil Engineering', ar: 'هندسة مدنية', ku: 'ئەندازیاری شارستانی' },
    { id: 'mech', en: 'Mechanical Engineering', ar: 'هندسة ميكانيك', ku: 'ئەندازیاری مایکینیک' },
    { id: 'elec', en: 'Electrical Engineering', ar: 'هندسة كهرباء', ku: 'ئەندازیاری کارەبا' },
    { id: 'arch', en: 'Architecture', ar: 'هندسة معمارية', ku: 'تەلارسازی' },
    { id: 'med', en: 'Medicine', ar: 'طب عام', ku: 'پزیشکی گشتی' },
    { id: 'dent', en: 'Dentistry', ar: 'طب أسنان', ku: 'پزیشکی ددان' },
    { id: 'pharm', en: 'Pharmacy', ar: 'صيدلة', ku: 'دەرمانسازی' },
    { id: 'law', en: 'Law', ar: 'قانون', ku: 'یاسا' },
    { id: 'english', en: 'English', ar: 'لغة إنجليزية', ku: 'زمانی ئینگلیزی' },
    { id: 'english_lit', en: 'English Literature', ar: 'أدب إنجليزي', ku: 'ئەدەبی ئینگلیزی' },
    { id: 'business', en: 'Business Administration', ar: 'إدارة أعمال', ku: 'کارگێڕی کار' },
    { id: 'accounting', en: 'Accounting', ar: 'محاسبة', ku: 'ژمێریاری' },
    { id: 'bio', en: 'Biology', ar: 'أحياء', ku: 'بایۆلۆجی' },
    { id: 'chem', en: 'Chemistry', ar: 'كيمياء', ku: 'کیمیا' },
    { id: 'physics', en: 'Physics', ar: 'فيزياء', ku: 'فیزیا' },
    { id: 'history', en: 'History', ar: 'تاريخ', ku: 'مێژوو' },
    { id: 'geo', en: 'Geography', ar: 'جغرافية', ku: 'جوگرافیا' },
    { id: 'psych', en: 'Psychology', ar: 'علم نفس', ku: 'دەرونزانی' },
    { id: 'socio', en: 'Sociology', ar: 'علم اجتماع', ku: 'سۆسیۆلۆجی' },
    { id: 'art', en: 'Fine Arts', ar: 'فنون جميلة', ku: 'هونەرە جوانەکان' },
    { id: 'media', en: 'Media', ar: 'إعلام', ku: 'ڕاگەیاندن' },
    { id: 'agri', en: 'Agriculture', ar: 'زراعة', ku: 'کشتوکاڵ' },
    { id: 'petro', en: 'Petroleum Engineering', ar: 'هندسة نفط', ku: 'ئەندازیاری نەوت' },
];

// Helper to find a unified ID based on any language input
export const getGovId = (val: string): string | undefined => {
  if (!val) return undefined;
  const lowerVal = val.toLowerCase().trim();
  return GOVERNORATE_DATA.find(g => 
    g.id === lowerVal ||
    g.en.toLowerCase() === lowerVal || 
    g.ar === val || 
    g.ku === val
  )?.id;
};

// Generic Translation Helper
export const getTranslation = (val: string, targetLang: Language, dataset: any[]): string => {
    if (!val) return val;
    const lowerVal = val.toLowerCase().trim();
    
    // Find the item in the dataset that matches the input value in ANY supported language
    const item = dataset.find(d => 
        d.id === lowerVal ||
        d.en.toLowerCase() === lowerVal ||
        d.ar === val || // Case sensitive for Arabic usually okay
        d.ku === val
    );

    if (item) {
        // Return the value in the target language
        return item[targetLang] || val;
    }

    return val;
}

export const TRANSLATIONS: Record<Language, Translation> = {
  ar: {
    title: "بوابتك للدراسة في أوروبا",
    subtitle: "نساعد الطلاب العراقيين الطموحين في الحصول على قبولات جامعية في منطقة شنغن وأوروبا.",
    cta: "ابدأ الآن",
    featuresTitle: "لماذا تختارنا؟",
    feature1: "استشارات متخصصة للجامعات الأوروبية",
    feature1Desc: "توجيه متخصص خلال عملية القبول في أفضل الجامعات الأوروبية.",
    feature2: "دعم كامل لملف التأشيرة (الفيزا)",
    feature2Desc: "دعم شامل لوثائق التأشيرة، مقابلات السفارة، والمتطلبات القانونية.",
    feature3: "شبكة واسعة من الجامعات الشريكة",
    feature3Desc: "شراكات مباشرة مع جامعات في منطقة شنغن لضمان نسب قبول أفضل.",
    formTitle: "استمارة التقديم",
    nameLabel: "الاسم الثلاثي",
    govLabel: "المحافظة",
    eduObtainedLabel: "المستوى التعليمي الحالي",
    eduSectionLabel: "القسم / التخصص الحالي",
    gradeLabel: "المعدل (اختياري)",
    eduWantedLabel: "المستوى التعليمي المرغوب",
    desiredMajorLabel: "التخصص المرغوب",
    countriesLabel: "الدول التي ترغب بالدراسة فيها (دولة واحدة كحد أدنى)",
    addCountry: "إضافة دولة +",
    removeCountry: "حذف",
    englishLabel: "مستوى اللغة الإنجليزية",
    phoneLabel: "رقم الهاتف / واتساب",
    phonePlaceholder: "أدخل 11 رقماً فقط",
    countryPlaceholder: "الدولة",
    submit: "إرسال الطلب",
    submitting: "جاري الإرسال...",
    successMessage: "تم إرسال طلبك! سيتم تقييم طلبك والتواصل معك من قبل Abroadify قريباً!",
    adminLogin: "دخول المسؤول",
    passwordPlaceholder: "أدخل كلمة المرور",
    login: "دخول",
    dashboardTitle: "لوحة التحكم - الطلبات المقدمة",
    noEntries: "لا توجد طلبات حتى الآن.",
    backToHome: "العودة للرئيسية",
    adminButton: "لوحة التحكم",
    selectOption: "اختر...",
    eduOptions: {
      secondary: "الإعدادية / الثانوية",
      bachelors: "بكالوريوس",
      masters: "ماجستير",
      phd: "دكتوراه"
    },
    governorates: GOVERNORATE_DATA.map(g => g.ar),
    minCountriesError: "يرجى اختيار دولة واحدة على الأقل",
    requiredError: "هذا الحقل مطلوب",
    phoneError: "يجب أن يتكون رقم الهاتف من 11 رقماً",
    englishProficiencyLevels: {
      beginner: "مبتدأ",
      elementary: "أساسي",
      intermediate: "متوسط",
      advanced: "متقدم",
      fluent: "طليق",
      native: "ناطق أصلي"
    }
  },
  ku: {
    title: "دەروازەی تۆ بۆ خوێندن لە ئەوروپا",
    subtitle: "یارمەتی خوێندکارانی عێراقی دەدەین بۆ بەدەستهێنانی کورسی خوێندن لە وڵاتانی شنگن و ئەوروپا.",
    cta: "دەست پێ بکە",
    featuresTitle: "بۆچی ئێمە هەڵدەبژێریت؟",
    feature1: "ڕاوێژکاری تایبەتمەند بۆ زانکۆکانی ئەوروپا",
    feature1Desc: "ڕێنمایی پسپۆڕانە لە پرۆسەی وەرگرتن لە زانکۆ پێشکەوتووەکانی ئەوروپا.",
    feature2: "پاڵپشتی تەواو بۆ ڤیزا",
    feature2Desc: "پاڵپشتی تەواو بۆ بەڵگەنامەکانی ڤیزا، چاوپێکەوتنی باڵیۆزخانە و مەرجە یاساییەکان.",
    feature3: "تۆڕێکی فراوان لە زانکۆکان",
    feature3Desc: "هاوبەشی ڕاستەوخۆ لەگەڵ زانکۆکانی شنگن بۆ مسۆگەرکردنی وەرگرتن.",
    formTitle: "فۆرمی پێشکەشکردن",
    nameLabel: "ناوی سیانی",
    govLabel: "پارێزگا",
    eduObtainedLabel: "ئاستی خوێندنی ئێستا",
    eduSectionLabel: "بەش / پسپۆڕی ئێستا",
    gradeLabel: "نمرە (ئارەزوومەندانە)",
    eduWantedLabel: "ئاستی خوێندنی داواکراو",
    desiredMajorLabel: "بەش / پسپۆڕی داواکراو",
    countriesLabel: "ئەو وڵاتانەی دەتەوێت لێیان بخوێنیت (لانی کەم ١)",
    addCountry: "وڵات زیاد بکە +",
    removeCountry: "سڕینەوە",
    englishLabel: "ئاستی زمانی ئینگلیزی",
    phoneLabel: "ژمارەی تەلەفۆن / واتسئەپ",
    phonePlaceholder: "تەنها ١١ ژمارە بنووسە",
    countryPlaceholder: "وڵاتی",
    submit: "ناردنی داواکاری",
    submitting: "ناردن...",
    successMessage: "داواکاریەکەت نێردرا! هەڵسەنگاندنت بۆ دەکرێت و بەم زووانە لەلایەن Abroadify پەیوەندیت پێوە دەکرێت!",
    adminLogin: "چوونەژووری ئەدمین",
    passwordPlaceholder: "وشەی تێپەڕ بنووسە",
    login: "چوونەژوورەوە",
    dashboardTitle: "داشبۆرد - داواکارییەکان",
    noEntries: "هیچ داواکارییەک نییە.",
    backToHome: "گەڕانەوە بۆ سەرەتا",
    adminButton: "تێڕوانینی ئەدمین",
    selectOption: "هەڵبژێرە...",
    eduOptions: {
      secondary: "ئامادەیی",
      bachelors: "بە بەکالۆریۆس",
      masters: "ماستەر",
      phd: "دکتۆرا"
    },
    governorates: GOVERNORATE_DATA.map(g => g.ku),
    minCountriesError: "تکایە لانی کەم ١ وڵات دیاری بکە",
    requiredError: "ئەم بەشە پێویستە",
    phoneError: "ژمارەی تەلەفۆن دەبێت ١١ ژمارە بێت",
    englishProficiencyLevels: {
      beginner: "سەرەتایی",
      elementary: "بنەڕەتی",
      intermediate: "ناوەند",
      advanced: "پێشکەوتوو",
      fluent: "بە ڕەوانی",
      native: "وەک زمانی دایک"
    }
  },
  en: {
    title: "Your Gateway to Study in Europe",
    subtitle: "Helping aspiring Iraqi students secure university admissions in the Schengen area and across Europe.",
    cta: "Get Started",
    featuresTitle: "Why Choose Us?",
    feature1: "Expert consultancy for European universities",
    feature1Desc: "Expert guidance through the admission process of top-tier European universities.",
    feature2: "Full support for visa applications",
    feature2Desc: "Comprehensive support for visa documentation, embassy interviews, and legal requirements.",
    feature3: "Wide network of partner institutions",
    feature3Desc: "Direct partnerships with universities across the Schengen area ensuring better acceptance rates.",
    formTitle: "Application Form",
    nameLabel: "Full Name",
    govLabel: "Governorate",
    eduObtainedLabel: "Current Education Level",
    eduSectionLabel: "Current Department / Major",
    gradeLabel: "Grade (Optional)",
    eduWantedLabel: "Desired Education Level",
    desiredMajorLabel: "Desired Department / Major",
    countriesLabel: "Target Countries (Min 1)",
    addCountry: "Add Country +",
    removeCountry: "Remove",
    englishLabel: "English Proficiency",
    phoneLabel: "Phone Number / WhatsApp",
    phonePlaceholder: "Enter 11 digits only",
    countryPlaceholder: "Country",
    submit: "Submit Application",
    submitting: "Submitting...",
    successMessage: "Your Application has been submitted! You will be evaluated and contacted by abroaidy soon!",
    adminLogin: "Admin Login",
    passwordPlaceholder: "Enter password",
    login: "Login",
    dashboardTitle: "Dashboard - Submissions",
    noEntries: "No submissions yet.",
    backToHome: "Back to Home",
    adminButton: "Admin View",
    selectOption: "Select...",
    eduOptions: {
      secondary: "Secondary School",
      bachelors: "Bachelor's Degree",
      masters: "Master's Degree",
      phd: "PhD"
    },
    governorates: GOVERNORATE_DATA.map(g => g.en),
    minCountriesError: "Please list at least 1 country",
    requiredError: "This field is required",
    phoneError: "Phone number must be exactly 11 digits",
    englishProficiencyLevels: {
      beginner: "Beginner",
      elementary: "Elementary",
      intermediate: "Intermediate",
      advanced: "Advanced",
      fluent: "Fluent",
      native: "Native"
    }
  }
};
