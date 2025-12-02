
export type Language = 'ar' | 'ku' | 'en';

export interface Program {
  id: string;
  programName: string;
  universityName: string;
  country: string;
  city: string;
  level: string;
  openDate: string;
  deadline: string;
  tuitionFee: number; // in Euro
  applicationFee: number; // in Euro
  link: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface StudentSubmission {
  id?: string;
  rfcNumber: string; // Serialized ID (e.g., RFC-123456)
  status: 'new' | 'contacting' | 'accepted' | 'rejected';
  adminNotes?: string;
  programs?: Program[]; // List of potential programs
  
  fullName: string;
  governorate: string;
  educationObtained: 'secondary' | 'bachelors' | 'masters';
  educationSection: string;
  grade?: string;
  educationWanted: 'bachelors' | 'masters' | 'phd';
  desiredMajor: string;
  targetCountries: string[];
  englishProficiency: number;
  phoneNumber: string;
  timestamp: number;
}

export interface Translation {
  title: string;
  subtitle: string;
  cta: string;
  featuresTitle: string;
  feature1: string;
  feature1Desc: string;
  feature2: string;
  feature2Desc: string;
  feature3: string;
  feature3Desc: string;
  formTitle: string;
  nameLabel: string;
  govLabel: string;
  eduObtainedLabel: string;
  eduSectionLabel: string;
  gradeLabel: string;
  eduWantedLabel: string;
  desiredMajorLabel: string;
  countriesLabel: string;
  addCountry: string;
  removeCountry: string;
  englishLabel: string;
  phoneLabel: string;
  phonePlaceholder: string;
  countryPlaceholder: string;
  submit: string;
  submitting: string;
  successMessage: string;
  adminLogin: string;
  passwordPlaceholder: string;
  login: string;
  dashboardTitle: string;
  noEntries: string;
  backToHome: string;
  adminButton: string;
  selectOption: string;
  eduOptions: {
    secondary: string;
    bachelors: string;
    masters: string;
    phd: string;
  };
  governorates: string[];
  minCountriesError: string;
  requiredError: string;
  phoneError: string;
  englishProficiencyLevels: {
    beginner: string;
    elementary: string;
    intermediate: string;
    advanced: string;
    fluent: string;
    native: string;
  };
}
