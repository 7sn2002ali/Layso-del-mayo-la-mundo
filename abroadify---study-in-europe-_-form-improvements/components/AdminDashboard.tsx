
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Translation, Language, StudentSubmission, Program } from '../types';
import { subscribeToSubmissions, deleteSubmission, batchSaveSubmissions, updateSubmission } from '../firebase';
import { Lock, Search, Download, Trash2, Filter, Database, Check, X, FileText, Briefcase, Plus, Save, ExternalLink, Eye, Sparkles, Copy, ChevronDown, ChevronUp, Upload, Edit2, ArrowUpDown } from 'lucide-react';
import { GOVERNORATE_DATA, getGovId } from '../constants';
import { MOCK_SUBMISSIONS } from '../mockData';
import * as XLSX from 'xlsx';

interface AdminDashboardProps {
  lang: Language;
  t: Translation;
  onBack: () => void;
}

type SortKey = keyof Program | 'location';
type SubmissionSortKey = keyof StudentSubmission | 'governorate_en';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'requests' | 'contacting'>('requests');
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [viewingOriginal, setViewingOriginal] = useState(false); // For showing the original form in Contacting tab
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGovId, setFilterGovId] = useState('');

  // Features
  const [draftCount, setDraftCount] = useState<number>(10);
  const [showDraftInput, setShowDraftInput] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Notes & Programs State
  const [tempNotes, setTempNotes] = useState('');
  
  // Program Editing State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [newProgram, setNewProgram] = useState<Partial<Program>>({
      priority: 'Medium',
      tuitionFee: 0,
      applicationFee: 0
  });
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [submissionSortConfig, setSubmissionSortConfig] = useState<{ key: SubmissionSortKey; direction: 'asc' | 'desc' } | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_PASS = "GTAgta77!";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect Password");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      const unsubscribe = subscribeToSubmissions((data) => {
        setSubmissions(data);
        // Sync selected submission if it exists and we are not just viewing original read-only
        if(selectedSubmission && !viewingOriginal) {
            const updated = data.find(s => s.id === selectedSubmission.id);
            if(updated) {
               // We keep local notes state separate until saved, but other fields sync
            }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated, selectedSubmission, viewingOriginal]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      try {
          await deleteSubmission(id);
          if(selectedSubmission?.id === id) setSelectedSubmission(null);
      } catch(e) {
          alert("Failed to delete item");
      }
  }

  const handleAddDrafts = async () => {
    if(draftCount > 60) {
        alert("Max 60 entries at once");
        return;
    }
    setLoading(true);
    const draftsToAdd: StudentSubmission[] = [];
    for(let i = 0; i < draftCount; i++) {
        const mock = MOCK_SUBMISSIONS[i % MOCK_SUBMISSIONS.length];
        draftsToAdd.push({
            ...mock,
            timestamp: Date.now() - Math.floor(Math.random() * 1000000000)
        });
    }
    await batchSaveSubmissions(draftsToAdd);
    setLoading(false);
    setShowDraftInput(false);
  }

  const getEnglishGov = (storedGov: string) => {
      const id = getGovId(storedGov);
      if (!id) return storedGov;
      const govObj = GOVERNORATE_DATA.find(g => g.id === id);
      return govObj ? govObj.en : storedGov;
  }

  const approveCustomer = async () => {
      if(!selectedSubmission || !selectedSubmission.id) return;
      await updateSubmission(selectedSubmission.id, { status: 'contacting' });
      setSelectedSubmission(null);
  };

  const saveNotes = async () => {
      if(!selectedSubmission || !selectedSubmission.id) return;
      await updateSubmission(selectedSubmission.id, { adminNotes: tempNotes });
      alert("Notes Saved!");
  };

  const handleGeneratePrompt = () => {
    if (!selectedSubmission) return;

    const prompt = `Role: Act as an expert educational consultant for international students.

Context: I have a prospective student from Iraq holding a ${selectedSubmission.educationObtained} in ${selectedSubmission.educationSection}. They are seeking a ${selectedSubmission.educationWanted} degree in ${selectedSubmission.desiredMajor} or anything close to that field.

Target Locations: ${selectedSubmission.targetCountries.join(', ')}.

Task: Conduct a deep, comprehensive search to identify suitable ${selectedSubmission.desiredMajor} programs for the upcoming academic intake (2025/2026). You must prioritize programs that accept international qualifications.

Data Requirements: Create a comprehensive table containing at least 15-20 distinct programs. The table must have the following exact columns in this specific order:

1. Program Name (e.g., MA English Literature)
2. University
3. Country 
4. City
5. Tuition (Numeric value only in EUR, e.g. 5000) - IMPORTANT: Do not add symbols like € or text like "per year". Just the number.
6. Application Fee (Numeric value only in EUR, e.g. 75) - IMPORTANT: Just the number.
7. Deadline (Format: dd/mm/yyyy) - IMPORTANT: Use this exact date format.
8. Link to the program - IMPORTANT: Paste the FULL RAW URL starting with http/https. Do not use markdown links (like [Link](url)). The cell should contain the full web address.

Constraints:
Ensure you check specific admission pages to verify the fees are for International Students, not EU/Home students.
If a specific deadline is not yet published for 2025, provide the typical window based on the previous year (e.g., "01/07/2025").`;

    setGeneratedPrompt(prompt);
  };

  const addOrUpdateProgram = async () => {
      if(!selectedSubmission || !selectedSubmission.id) return;
      if(!newProgram.programName || !newProgram.universityName) {
          alert("Program Name and University are required.");
          return;
      }

      const program: Program = {
          id: editingProgramId || Date.now().toString(),
          programName: newProgram.programName || '',
          universityName: newProgram.universityName || '',
          country: newProgram.country || '',
          city: newProgram.city || '',
          level: newProgram.level || '',
          openDate: newProgram.openDate || '',
          deadline: newProgram.deadline || '',
          tuitionFee: Number(newProgram.tuitionFee) || 0,
          applicationFee: Number(newProgram.applicationFee) || 0,
          link: newProgram.link || '',
          priority: (newProgram.priority as any) || 'Medium'
      };

      const currentPrograms = selectedSubmission.programs || [];
      let updatedPrograms;

      if (editingProgramId) {
          // Update existing
          updatedPrograms = currentPrograms.map(p => p.id === editingProgramId ? program : p);
      } else {
          // Add new
          updatedPrograms = [...currentPrograms, program];
      }
      
      await updateSubmission(selectedSubmission.id, { programs: updatedPrograms });
      
      // Update local state
      setSelectedSubmission({
          ...selectedSubmission,
          programs: updatedPrograms
      });
      
      cancelEdit();
  };

  const handleOpenAddProgram = () => {
      setNewProgram({ priority: 'Medium', tuitionFee: 0, applicationFee: 0 });
      setEditingProgramId(null);
      setShowProgramModal(true);
  };

  const startEditProgram = (program: Program) => {
      setNewProgram(program);
      setEditingProgramId(program.id);
      setShowProgramModal(true);
  };

  const cancelEdit = () => {
      setNewProgram({ priority: 'Medium', tuitionFee: 0, applicationFee: 0 });
      setEditingProgramId(null);
      setShowProgramModal(false);
  };

  const removeProgram = async (programId: string) => {
      if(!selectedSubmission || !selectedSubmission.id) return;
      const currentPrograms = selectedSubmission.programs || [];
      const updatedPrograms = currentPrograms.filter(p => p.id !== programId);
      
      await updateSubmission(selectedSubmission.id, { programs: updatedPrograms });
      setSelectedSubmission({
          ...selectedSubmission,
          programs: updatedPrograms
      });
  };

  // EXCEL IMPORT HELPERS
  const parseExcelDate = (serial: any): string => {
     if (!serial) return '';
     // If it's already a string (e.g. "25/12/2025"), return it
     if (typeof serial === 'string') return serial;
     // If it's a number (Excel serial date)
     if (typeof serial === 'number') {
        const utc_days  = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        // Add a day because of leap year bug in Excel or timezone adjustments often needed
        // But basic UTC extraction is usually "close enough" for deadlines or we format specifically
        const day = date_info.getDate().toString().padStart(2, '0');
        const month = (date_info.getMonth() + 1).toString().padStart(2, '0');
        const year = date_info.getFullYear();
        return `${day}/${month}/${year}`;
     }
     return String(serial);
  };

  const handleImportClick = () => {
      if (fileInputRef.current) {
          fileInputRef.current.click();
      }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !selectedSubmission?.id) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

          // Expecting format:
          // Row 0: Headers
          // Row 1+: Data
          // Columns: 0:Name, 1:Uni, 2:Country, 3:City, 4:Tuition, 5:AppFee, 6:Deadline, 7:Link

          const importedPrograms: Program[] = jsonData.slice(1).map((row, index) => {
               // Robust parsing for numbers (stripping currency symbols if Gemini messed up)
               const parseMoney = (val: any) => {
                   if (typeof val === 'number') return val;
                   if (!val) return 0;
                   const cleaned = val.toString().replace(/[^0-9.]/g, '');
                   return parseFloat(cleaned) || 0;
               };

               return {
                  id: `imported_${Date.now()}_${index}`,
                  programName: row[0] || 'Unknown Program',
                  universityName: row[1] || 'Unknown University',
                  country: row[2] || '',
                  city: row[3] || '',
                  tuitionFee: parseMoney(row[4]),
                  applicationFee: parseMoney(row[5]),
                  deadline: parseExcelDate(row[6]), // Parse date safely
                  link: row[7] || '',
                  priority: 'Low', // Default Priority as requested
                  level: '', 
                  openDate: ''
               };
          }).filter(p => p.programName !== 'Unknown Program'); 

          const currentPrograms = selectedSubmission.programs || [];
          const updatedPrograms = [...currentPrograms, ...importedPrograms];

          await updateSubmission(selectedSubmission.id, { programs: updatedPrograms });
          setSelectedSubmission({
              ...selectedSubmission,
              programs: updatedPrograms
          });
          
          alert(`Successfully imported ${importedPrograms.length} programs!`);
          
          // Reset input
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsArrayBuffer(file);
  };

  // SORTING HELPERS (PROGRAMS)
  const handleSort = (key: SortKey) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSortConfig({ key, direction });
  };

  const getSortedPrograms = () => {
      const programs = selectedSubmission?.programs || [];
      if (!sortConfig) {
          // Default sort by Priority (High -> Low)
          return [...programs].sort((a, b) => {
              const priorityMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
              return priorityMap[b.priority] - priorityMap[a.priority];
          });
      }

      return [...programs].sort((a, b) => {
          let aValue: any = a[sortConfig.key as keyof Program];
          let bValue: any = b[sortConfig.key as keyof Program];

          // Special handling for Location sort
          if (sortConfig.key === 'location') {
              aValue = `${a.country} ${a.city}`;
              bValue = `${b.country} ${b.city}`;
          }

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
      });
  };
  
  // SORTING HELPERS (SUBMISSIONS)
  const handleSubmissionSort = (key: SubmissionSortKey) => {
      let direction: 'asc' | 'desc' = 'asc';
      if (submissionSortConfig && submissionSortConfig.key === key && submissionSortConfig.direction === 'asc') {
          direction = 'desc';
      }
      setSubmissionSortConfig({ key, direction });
  };

  const openModal = (sub: StudentSubmission) => {
      setSelectedSubmission(sub);
      setTempNotes(sub.adminNotes || '');
      setViewingOriginal(false);
      setGeneratedPrompt(''); // Reset prompt on new open
      cancelEdit(); // Reset form state
      setSortConfig(null); // Reset sort
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
    setGeneratedPrompt('');
    cancelEdit();
  };

  const filteredSubmissions = submissions.filter(sub => {
    // Tab Filter
    if (activeTab === 'requests' && sub.status !== 'new') return false;
    if (activeTab === 'contacting' && sub.status !== 'contacting') return false;

    // Search Filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = sub.fullName.toLowerCase().includes(searchLower) ||
                          sub.phoneNumber.includes(searchTerm) ||
                          sub.rfcNumber.toLowerCase().includes(searchLower);
    
    // Gov Filter
    let matchesGov = true;
    if (filterGovId) {
        const rowGovId = getGovId(sub.governorate);
        matchesGov = rowGovId === filterGovId;
    }

    return matchesSearch && matchesGov;
  });

  const sortedSubmissions = useMemo(() => {
    let data = [...filteredSubmissions];
    if (!submissionSortConfig) return data;

    return data.sort((a, b) => {
        let aValue: any = a[submissionSortConfig.key as keyof StudentSubmission];
        let bValue: any = b[submissionSortConfig.key as keyof StudentSubmission];

        if (submissionSortConfig.key === 'governorate_en') {
             aValue = getEnglishGov(a.governorate);
             bValue = getEnglishGov(b.governorate);
        }

        if (aValue < bValue) return submissionSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return submissionSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [filteredSubmissions, submissionSortConfig]);

  const exportToCSV = () => {
    const headers = ["RFC", "Name", "Status", "Phone", "Target Level", "Target Countries", "Date"];
    const rows = sortedSubmissions.map(s => [
      `"${s.rfcNumber}"`,
      `"${s.fullName}"`,
      `"${s.status}"`,
      `"${s.phoneNumber}"`,
      `"${s.educationWanted}"`,
      `"${s.targetCountries.join('|')}"`,
      `"${new Date(s.timestamp).toLocaleDateString()}"`
    ]);
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `submissions_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------------

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="flex justify-center mb-6 text-primary dark:text-blue-400">
            <Lock size={48} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none bg-white dark:bg-gray-700 dark:text-white"
            />
            <button type="submit" className="w-full bg-primary dark:bg-blue-600 text-white py-3 rounded-lg font-bold">Login</button>
          </form>
          <button onClick={onBack} className="w-full text-center mt-4 text-sm text-gray-500">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[95%] mx-auto px-4 py-8 animate-fade-in text-left" dir="ltr">
      
      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="flex flex-wrap gap-2">
            {/* Drafts Button */}
             <div className="relative">
                {showDraftInput ? (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                        <input type="number" min="1" max="60" value={draftCount} onChange={(e) => setDraftCount(parseInt(e.target.value))} className="w-16 px-2 py-1 rounded text-sm text-black dark:text-white dark:bg-gray-600" />
                        <button onClick={handleAddDrafts} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Go</button>
                        <button onClick={() => setShowDraftInput(false)} className="text-xs text-red-500 px-1">X</button>
                    </div>
                ) : (
                    <button onClick={() => setShowDraftInput(true)} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700">
                        <Database size={16} /> Add Drafts
                    </button>
                )}
            </div>
            <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700">
                <Download size={16} /> Export CSV
            </button>
            <button onClick={() => setIsAuthenticated(false)} className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600">Logout</button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-gray-800 text-primary dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
          >
             <div className="flex items-center gap-2">
                 <FileText size={16} /> Customer Requests
             </div>
          </button>
          <button
            onClick={() => setActiveTab('contacting')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'contacting' ? 'bg-white dark:bg-gray-800 text-primary dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'}`}
          >
             <div className="flex items-center gap-2">
                 <Briefcase size={16} /> Contacting Customer
             </div>
          </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-6 border border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 items-center">
         <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute top-2.5 left-3 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search RFC, Name, Phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-primary"
            />
         </div>
         <select 
            value={filterGovId} 
            onChange={(e) => setFilterGovId(e.target.value)} 
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-primary"
        >
            <option value="">All Governorates</option>
            {GOVERNORATE_DATA.map(g => (
                <option key={g.id} value={g.id}>{g.en}</option>
            ))}
        </select>
         <div className="text-sm text-gray-500">
            {sortedSubmissions.length} entries
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th 
                    onClick={() => handleSubmissionSort('rfcNumber')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                >
                    <div className="flex items-center gap-1">
                        RFC
                        {submissionSortConfig?.key === 'rfcNumber' ? (submissionSortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                    </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th 
                    onClick={() => handleSubmissionSort('governorate_en')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                >
                    <div className="flex items-center gap-1">
                        Gov
                        {submissionSortConfig?.key === 'governorate_en' ? (submissionSortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                    </div>
                </th>
                <th 
                    onClick={() => handleSubmissionSort('englishProficiency')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                >
                    <div className="flex items-center gap-1">
                        Eng Lvl
                        {submissionSortConfig?.key === 'englishProficiency' ? (submissionSortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                    </div>
                </th>
                <th 
                    onClick={() => handleSubmissionSort('educationObtained')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                >
                    <div className="flex items-center gap-1">
                        Current Edu
                        {submissionSortConfig?.key === 'educationObtained' ? (submissionSortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                    </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Major</th>
                <th 
                    onClick={() => handleSubmissionSort('educationWanted')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                >
                     <div className="flex items-center gap-1">
                        Target Lvl
                        {submissionSortConfig?.key === 'educationWanted' ? (submissionSortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                    </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Major</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target Countries</th>
                <th 
                    onClick={() => handleSubmissionSort('timestamp')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors group"
                >
                    <div className="flex items-center gap-1">
                        Date
                        {submissionSortConfig?.key === 'timestamp' ? (submissionSortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                    </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {loading ? (
                <tr><td colSpan={12} className="px-6 py-4 text-center">Loading...</td></tr>
              ) : sortedSubmissions.length === 0 ? (
                <tr><td colSpan={12} className="px-6 py-10 text-center text-gray-500">No entries found.</td></tr>
              ) : (
                sortedSubmissions.map((sub) => (
                  <tr 
                    key={sub.id} 
                    onClick={() => openModal(sub)}
                    className="hover:bg-blue-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-primary dark:text-blue-400 font-bold">{sub.rfcNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{sub.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{sub.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{getEnglishGov(sub.governorate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-center">{sub.englishProficiency}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{sub.educationObtained}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{sub.educationSection}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{sub.educationWanted}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{sub.desiredMajor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={sub.targetCountries.join(', ')}>{sub.targetCountries.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(sub.timestamp).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                            onClick={(e) => sub.id && handleDelete(sub.id, e)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors"
                            title="Delete"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* REQUEST DETAIL MODAL (New -> Contacting OR View Original) */}
      {selectedSubmission && ((activeTab === 'requests' && !viewingOriginal) || viewingOriginal) && (
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 ${viewingOriginal ? 'bg-black/80' : ''}`}>
           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in relative border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => {
                    if (viewingOriginal) setViewingOriginal(false);
                    else handleCloseModal();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                  <X size={24} />
              </button>
              
              <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {viewingOriginal ? 'Original Application' : 'Request Details'}
                      </h2>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm font-mono px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                          {selectedSubmission.rfcNumber}
                      </span>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-8">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-700 dark:text-gray-300">
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Full Name</span> <span className="text-base font-medium text-gray-900 dark:text-white">{selectedSubmission.fullName}</span></div>
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Phone</span> <span className="text-base font-medium text-gray-900 dark:text-white font-mono">{selectedSubmission.phoneNumber}</span></div>
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Governorate</span> {getEnglishGov(selectedSubmission.governorate)}</div>
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">English Level</span> {selectedSubmission.englishProficiency}/10</div>
                          
                          <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 my-2"></div>
                          
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Current Edu</span> {selectedSubmission.educationObtained}</div>
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Section/Major</span> {selectedSubmission.educationSection} {selectedSubmission.grade && `(Grade: ${selectedSubmission.grade})`}</div>
                          
                          <div className="col-span-2 border-t border-gray-200 dark:border-gray-700 my-2"></div>

                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Desired Level</span> {selectedSubmission.educationWanted}</div>
                          <div><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Desired Major</span> {selectedSubmission.desiredMajor}</div>
                          <div className="col-span-2"><span className="block text-xs text-gray-500 dark:text-gray-500 uppercase font-semibold">Target Countries</span> {selectedSubmission.targetCountries.join(' | ')}</div>
                      </div>
                  </div>

                  <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => {
                            if (viewingOriginal) setViewingOriginal(false);
                            else handleCloseModal();
                        }}
                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                      >
                          Close
                      </button>
                      {!viewingOriginal && (
                          <button 
                            onClick={approveCustomer}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 shadow-md font-bold transition-transform active:scale-95"
                          >
                              <Check size={18} /> Approve Customer
                          </button>
                      )}
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* WORK VIEW MODAL (Contacting -> Programs) FULLSCREEN */}
      {selectedSubmission && activeTab === 'contacting' && !viewingOriginal && (
        <div className="fixed inset-0 w-screen h-screen bg-white dark:bg-gray-900 z-50 overflow-hidden flex flex-col md:flex-row">
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white z-50 transition-colors bg-white dark:bg-gray-800 rounded-full p-2 shadow-sm"
              >
                  <X size={24} />
              </button>

              {/* LEFT COLUMN: Summary & Notes */}
              <div className="w-full md:w-1/4 bg-gray-50 dark:bg-gray-900 p-8 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-y-auto">
                  <div className="mb-8">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">{selectedSubmission.fullName}</h3>
                      </div>
                      <p className="font-mono text-sm text-blue-600 dark:text-blue-400 mb-6 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded w-fit">{selectedSubmission.rfcNumber}</p>
                      
                      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                          <p className="flex items-center gap-2"><span className="w-5 text-center">📱</span> <span className="text-gray-900 dark:text-gray-200">{selectedSubmission.phoneNumber}</span></p>
                          <p className="flex items-center gap-2"><span className="w-5 text-center">📍</span> <span>{getEnglishGov(selectedSubmission.governorate)}</span></p>
                          <p className="flex items-center gap-2"><span className="w-5 text-center">🎓</span> <span>{selectedSubmission.educationWanted} in {selectedSubmission.desiredMajor}</span></p>
                           <p className="flex items-center gap-2"><span className="w-5 text-center">🏛</span> <span>Current: {selectedSubmission.educationObtained} ({selectedSubmission.educationSection})</span></p>
                          <p className="flex items-center gap-2"><span className="w-5 text-center">🌍</span> <span className="italic">{selectedSubmission.targetCountries.join(', ')}</span></p>
                      </div>

                      <button 
                        onClick={() => setViewingOriginal(true)}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors text-sm border border-gray-300 dark:border-gray-600"
                      >
                          <Eye size={16} /> View Original Application
                      </button>

                      {/* PROMPT GENERATOR */}
                      <div className="mt-4">
                        <button 
                            onClick={handleGeneratePrompt}
                            className="w-full flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-2.5 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 font-medium transition-colors text-sm border border-purple-200 dark:border-purple-800"
                        >
                            <Sparkles size={16} /> GET PROMPT
                        </button>
                        
                        {generatedPrompt && (
                            <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in shadow-inner">
                                <textarea 
                                    readOnly
                                    value={generatedPrompt}
                                    className="w-full h-32 text-xs p-2 mb-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded border border-gray-200 dark:border-gray-700 resize-none outline-none focus:ring-1 focus:ring-purple-500"
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedPrompt);
                                        alert("Prompt copied to clipboard!");
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    <Copy size={12} /> Copy Prompt
                                </button>
                            </div>
                        )}
                      </div>
                  </div>

                  <div className="flex-grow flex flex-col mt-4">
                      <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Admin Notes</label>
                      <textarea 
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        className="flex-grow w-full min-h-[200px] p-4 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none resize-none mb-4"
                        placeholder="Write internal notes about the client here..."
                      />
                      <button 
                        onClick={saveNotes}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                          <Save size={18} /> Save Notes
                      </button>
                  </div>
              </div>

              {/* RIGHT COLUMN: Programs Manager */}
              <div className="w-full md:w-3/4 p-8 bg-white dark:bg-gray-800 h-full overflow-y-auto">
                  <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-5 flex justify-between items-center">
                      <div>
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                              <Briefcase className="text-primary dark:text-blue-400" size={32} /> Potential Programs
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage university programs and applications for this client.</p>
                      </div>
                      
                      {/* File Upload Input & Button & Add Button */}
                      <div className="flex gap-2">
                          <button 
                            onClick={handleOpenAddProgram}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                          >
                            <Plus size={18} /> Add New Program
                          </button>
                          
                          <input 
                              type="file" 
                              accept=".xlsx, .xls"
                              ref={fileInputRef}
                              className="hidden" 
                              onChange={handleFileUpload}
                          />
                          <button 
                              onClick={handleImportClick}
                              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm font-medium"
                          >
                              <Upload size={18} /> Import Excel
                          </button>
                      </div>
                  </div>

                  {/* Programs Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-100 dark:bg-gray-900">
                              <tr>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Program</th>
                                  
                                  {/* Sortable Headers */}
                                  <th 
                                    onClick={() => handleSort('universityName')}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                  >
                                    <div className="flex items-center gap-1">
                                        University 
                                        {sortConfig?.key === 'universityName' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                                    </div>
                                  </th>
                                  <th 
                                    onClick={() => handleSort('location')}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                  >
                                     <div className="flex items-center gap-1">
                                        Location
                                        {sortConfig?.key === 'location' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                                     </div>
                                  </th>
                                  <th 
                                    onClick={() => handleSort('tuitionFee')}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                  >
                                     <div className="flex items-center gap-1">
                                        Tuition (€)
                                        {sortConfig?.key === 'tuitionFee' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                                     </div>
                                  </th>
                                  <th 
                                    onClick={() => handleSort('applicationFee')}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                  >
                                     <div className="flex items-center gap-1">
                                        App Fee (€)
                                        {sortConfig?.key === 'applicationFee' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                                     </div>
                                  </th>
                                  <th 
                                    onClick={() => handleSort('deadline')}
                                    className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors group"
                                  >
                                     <div className="flex items-center gap-1">
                                        Deadline
                                        {sortConfig?.key === 'deadline' ? (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>) : <ArrowUpDown size={14} className="opacity-30 group-hover:opacity-100" />}
                                     </div>
                                  </th>
                                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                              </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                             {getSortedPrograms().map((prog) => (
                                    <tr key={prog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${prog.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : prog.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                               {prog.priority}
                                             </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{prog.programName}</div>
                                            {prog.link && (
                                                <a href={prog.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1 max-w-[200px] truncate" title={prog.link}>
                                                    {prog.link.substring(0, 30)}{prog.link.length > 30 ? '...' : ''} <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{prog.universityName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{prog.city}, {prog.country}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{prog.tuitionFee}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">{prog.applicationFee}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{prog.deadline || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        const query = encodeURIComponent(`${prog.programName} ${prog.universityName}`);
                                                        window.open(`https://www.google.com/search?q=${query}`, '_blank');
                                                    }}
                                                    className="text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 p-2 rounded-full transition-colors"
                                                    title="Search on Google"
                                                >
                                                    <Search size={18} />
                                                </button>
                                                <button
                                                    onClick={() => startEditProgram(prog)}
                                                    className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-full transition-colors"
                                                    title="Edit Program"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => removeProgram(prog.id)} 
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors"
                                                    title="Remove Program"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                             }
                             {(!selectedSubmission.programs || selectedSubmission.programs.length === 0) && (
                                 <tr>
                                     <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                                         No programs added yet. Use the form above or Import Excel to add one.
                                     </td>
                                 </tr>
                             )}
                          </tbody>
                        </table>
                     </div>
                  </div>

              </div>
        </div>
      )}

      {/* PROGRAM EDITOR MODAL (Add/Edit) */}
      {showProgramModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {editingProgramId ? <Edit2 size={24} className="text-blue-500" /> : <Plus size={24} className="text-blue-500" />} 
                            {editingProgramId ? 'Edit Program Details' : 'Add New Program'}
                        </h3>
                        <button 
                            onClick={cancelEdit}
                            className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Program Name *</label>
                                <input 
                                    placeholder="e.g. Master of Business Administration" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.programName || ''}
                                    onChange={e => setNewProgram({...newProgram, programName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">University Name *</label>
                                <input 
                                    placeholder="e.g. University of Berlin" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.universityName || ''}
                                    onChange={e => setNewProgram({...newProgram, universityName: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Country</label>
                                <input 
                                    placeholder="e.g. Germany" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.country || ''}
                                    onChange={e => setNewProgram({...newProgram, country: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">City</label>
                                <input 
                                    placeholder="e.g. Berlin" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.city || ''}
                                    onChange={e => setNewProgram({...newProgram, city: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Deadline (dd/mm/yyyy)</label>
                                <input 
                                    type="text"
                                    placeholder="e.g. 15/07/2025" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.deadline || ''}
                                    onChange={e => setNewProgram({...newProgram, deadline: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Tuition Fee (€/Year)</label>
                                <input 
                                    type="number"
                                    placeholder="0" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.tuitionFee || ''}
                                    onChange={e => setNewProgram({...newProgram, tuitionFee: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Application Fee (€)</label>
                                <input 
                                    type="number"
                                    placeholder="0" 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.applicationFee || ''}
                                    onChange={e => setNewProgram({...newProgram, applicationFee: parseFloat(e.target.value)})}
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                                <select 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.priority}
                                    onChange={e => setNewProgram({...newProgram, priority: e.target.value as any})}
                                >
                                    <option value="High">High Priority</option>
                                    <option value="Medium">Medium Priority</option>
                                    <option value="Low">Low Priority</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Program Link URL</label>
                                <input 
                                    placeholder="https://university.edu/program..." 
                                    className="w-full p-3 rounded-lg text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
                                    value={newProgram.link || ''}
                                    onChange={e => setNewProgram({...newProgram, link: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button 
                                onClick={cancelEdit}
                                className="px-6 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={addOrUpdateProgram}
                                className="bg-primary dark:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors shadow-lg"
                            >
                                {editingProgramId ? 'Save Changes' : 'Add Program'}
                            </button>
                        </div>
                    </div>
               </div>
          </div>
      )}

    </div>
  );
};

export default AdminDashboard;
