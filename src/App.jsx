import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon, 
  Book,
  PenLine, 
  CheckSquare, 
  Trophy, 
  Plus,
  Trash2,
  Settings,
  Download,
  Upload,
  User,
  X,
  AlertCircle,
  FileText,
  Copy,
  Pencil
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_HABITS = [
  { id: 'h1', name: 'Book Reading', icon: '📖' },
  { id: 'h2', name: 'Exercise', icon: '💪' },
  { id: 'h3', name: 'Meditation', icon: '🧘' },
  { id: 'h4', name: 'No Reels', icon: '📱' },
  { id: 'h5', name: 'No Added Sugar', icon: '🥗' },
];

const EMOJI_OPTIONS = [
  '💧', '📖', '💪', '🧘', '🥗', '💤', '💼', '🧹', '🎸', '🎨', 
  '🍳', '🚶', '💊', '🚭', '💰', '🪴', '📱', '🛁', '📝', '☀️',
  '🏃', '🚲', '🥦', '🍎', '📵', '💻', '🎓', '🐶', '🎹', '✨'
];

const DEFAULT_AVATAR = "https://api.dicebear.com/9.x/notionists/svg?seed=Mackenzie&hair=hat&backgroundColor=b6e3f4";

export default function App() {
  // State
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); 
  const [view, setView] = useState('daily'); 
  const [data, setData] = useState({}); 
  const [userHabits, setUserHabits] = useState(DEFAULT_HABITS);
  const [userName, setUserName] = useState('Admin'); // Default name
  const [lastBackupDate, setLastBackupDate] = useState(null);
  const [showBackupWarning, setShowBackupWarning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false); // Safety flag
  
  // Settings Modal State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  
  // Habit Editing State
  const [habitNameInput, setHabitNameInput] = useState('');
  const [habitIconInput, setHabitIconInput] = useState('✨');
  const [editingHabitId, setEditingHabitId] = useState(null); // ID of habit being edited
  
  // File Import Ref
  const fileInputRef = useRef(null);
  
  // Status Notification
  const [statusMsg, setStatusMsg] = useState('');

  // --- INITIAL DATA LOAD ---
  useEffect(() => {
    const savedData = localStorage.getItem('journal_2026_data');
    const savedHabits = localStorage.getItem('journal_2026_habits');
    const savedProfile = localStorage.getItem('journal_2026_profile');
    const savedBackupDate = localStorage.getItem('journal_2026_last_backup');
    
    if (savedData) {
      try { 
        const parsed = JSON.parse(savedData);
        if (parsed && typeof parsed === 'object') setData(parsed); 
      } catch (e) { console.error("Data load error", e); }
    }
    
    if (savedHabits) {
      try { 
        const parsed = JSON.parse(savedHabits);
        if (Array.isArray(parsed)) setUserHabits(parsed); 
      } catch (e) { console.error("Habit load error", e); }
    }
    
    if (savedProfile) {
      try { 
        const parsed = JSON.parse(savedProfile);
        setUserName(parsed.name || 'Admin'); 
      } catch (e) { console.error(e); }
    }
    
    if (savedBackupDate) {
      const d = new Date(savedBackupDate);
      // Valid date check
      if (!isNaN(d.getTime())) {
        setLastBackupDate(d);
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - d.getTime() > sevenDays) {
          setShowBackupWarning(true);
        }
      } else {
        setShowBackupWarning(true);
      }
    } else {
      setShowBackupWarning(true);
    }

    setIsLoaded(true); // Mark load as complete
  }, []);

  // --- DATA PERSISTENCE ---
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('journal_2026_data', JSON.stringify(data));
    }
  }, [data, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('journal_2026_habits', JSON.stringify(userHabits));
    }
  }, [userHabits, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('journal_2026_profile', JSON.stringify({ name: userName }));
    }
  }, [userName, isLoaded]);

  // Status Message Timer
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // Date Helpers
  const dateKey = useMemo(() => {
    if (!currentDate) return "2026-01-01";
    return currentDate.toISOString().split('T')[0];
  }, [currentDate]);

  const currentEntry = useMemo(() => {
    return data[dateKey] || {
      tasks: [],
      habits: {},
      notes: '',
      mood: null,
      gratitude: ''
    };
  }, [data, dateKey]);

  // Actions
  const updateEntry = (updates) => {
    setData(prev => ({
      ...prev,
      [dateKey]: { ...prev[dateKey], ...updates }
    }));
  };
  
  const updateDayData = (dateStr, updates) => {
    setData(prev => ({
      ...prev,
      [dateStr]: { ...prev[dateStr] || {}, ...updates }
    }));
  };

  const changeDay = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const toggleHabit = (habitId) => {
    const currentHabits = currentEntry.habits || {};
    updateEntry({
      habits: {
        ...currentHabits,
        [habitId]: !currentHabits[habitId]
      }
    });
  };

  const moveHabit = (index, direction) => {
    const newHabits = [...userHabits];
    if (direction === 'up' && index > 0) {
      [newHabits[index], newHabits[index - 1]] = [newHabits[index - 1], newHabits[index]];
    } else if (direction === 'down' && index < newHabits.length - 1) {
      [newHabits[index], newHabits[index + 1]] = [newHabits[index + 1], newHabits[index]];
    }
    setUserHabits(newHabits);
  };

  const startEditingHabit = (habit) => {
    setEditingHabitId(habit.id);
    setHabitNameInput(habit.name);
    setHabitIconInput(habit.icon);
  };

  const saveHabit = () => {
    if (!habitNameInput.trim()) return;

    if (editingHabitId) {
        // Update existing
        setUserHabits(prev => prev.map(h => 
            h.id === editingHabitId 
            ? { ...h, name: habitNameInput, icon: habitIconInput } 
            : h
        ));
        setEditingHabitId(null);
        setStatusMsg('Habit updated!');
    } else {
        // Add new
        setUserHabits([{ id: Date.now().toString(), name: habitNameInput, icon: habitIconInput || '✨' }, ...userHabits]);
        setStatusMsg('Habit added!');
    }
    // Reset fields
    setHabitNameInput('');
    setHabitIconInput('✨');
  };

  const addTask = (text) => {
    if (!text.trim()) return;
    const currentTasks = currentEntry.tasks || [];
    updateEntry({
      tasks: [{ id: Date.now(), text, completed: false }, ...currentTasks]
    });
  };

  const toggleTask = (taskId) => {
    const currentTasks = currentEntry.tasks || [];
    let updatedTasks = currentTasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    updatedTasks.sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
    updateEntry({
      tasks: updatedTasks
    });
  };

  const deleteTask = (taskId) => {
    const currentTasks = currentEntry.tasks || [];
    updateEntry({
      tasks: currentTasks.filter(t => t.id !== taskId)
    });
  };

  const openSettings = (tab = 'profile') => {
      setActiveSettingsTab(tab);
      setShowSettingsModal(true);
      // Reset editing state when opening
      setEditingHabitId(null);
      setHabitNameInput('');
      setHabitIconInput('✨');
  };

  const deleteHabitSafe = (habitId) => {
      if(window.confirm("Are you sure? Deleting this habit will hide it from your past summaries as well.")) {
          setUserHabits(prev => prev.filter(h => h.id !== habitId));
      }
  };

  // --- IMPORT / EXPORT LOGIC ---
  const handleExport = () => {
    try {
      const backup = {
        version: 1,
        generated: new Date().toISOString(),
        data: data,
        habits: userHabits,
        profile: { name: userName }
      };
      
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal_backup_2026_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      const now = new Date();
      setLastBackupDate(now);
      localStorage.setItem('journal_2026_last_backup', now.toISOString());
      setShowBackupWarning(false);
      setStatusMsg('Data exported successfully!');
    } catch (err) {
      console.error("Export failed", err);
      setStatusMsg('Export failed.');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (backup.data && typeof backup.data === 'object') setData(backup.data);
        if (backup.habits && Array.isArray(backup.habits)) setUserHabits(backup.habits);
        if (backup.profile && backup.profile.name) setUserName(backup.profile.name);
        
        setStatusMsg('Backup restored successfully!');
        setShowSettingsModal(false);
      } catch (err) {
        alert('Invalid backup file. Please try again.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  // --- SUMMARY / TABLE LOGIC ---
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  // --- RENDER LOGIC ---
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-stone-50 border border-stone-100/50"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dDate = new Date(year, month, d);
      const dKey = dDate.toISOString().split('T')[0];
      const entry = data[dKey];
      const isSelected = d === currentDate.getDate();
      
      let completedHabits = 0;
      if (entry && entry.habits) {
        completedHabits = Object.values(entry.habits).filter(Boolean).length;
      }
      const totalHabits = userHabits.length;
      const progress = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

      let moodColor = 'text-stone-300';
      if (entry?.mood) {
          if (entry.mood >= 8) moodColor = 'text-emerald-500';
          else if (entry.mood >= 5) moodColor = 'text-amber-500';
          else moodColor = 'text-rose-500';
      }

      days.push(
        <div 
          key={d} 
          onClick={() => {
            setCurrentDate(new Date(year, month, d));
            setView('daily');
          }}
          className={`h-32 p-2 border border-stone-200 cursor-pointer transition-colors relative group flex flex-col justify-between
            ${isSelected ? 'bg-amber-50 ring-2 ring-inset ring-amber-200' : 'bg-white hover:bg-stone-50'}
          `}
        >
          <div className="flex justify-between items-start">
             <span className={`text-sm font-semibold ${isSelected ? 'text-amber-800' : 'text-stone-600'}`}>{d}</span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center gap-1">
             {entry?.mood && (
                 <div className={`text-2xl font-bold font-serif ${moodColor}`}>
                    {entry.mood}<span className="text-xs opacity-50">/10</span>
                 </div>
             )}
          </div>
          
          <div className="space-y-1">
            <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${completedHabits > 0 ? 'bg-green-400' : 'bg-transparent'}`}
                  style={{ width: `${progress}%` }}
                />
            </div>
            {entry?.tasks?.length > 0 && (
              <div className="flex gap-0.5 justify-center">
                {entry.tasks.slice(0, 3).map((t, i) => (
                  <div key={i} className={`w-1 h-1 rounded-full ${t.completed ? 'bg-stone-400' : 'border border-stone-300'}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-stone-200 border border-stone-200 shadow-sm rounded-lg overflow-hidden">
        {WEEKDAYS.map(w => (
          <div key={w} className="bg-stone-100 p-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider">
            {w}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderSummaryTable = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      
      const rows = [];
      for(let d=1; d <= daysInMonth; d++) {
          const dDate = new Date(year, month, d);
          const dKey = dDate.toISOString().split('T')[0];
          const entry = data[dKey];
          
          rows.push(
              <tr key={d} className={`border-b border-stone-100 hover:bg-stone-50 ${d === currentDate.getDate() ? 'bg-amber-50' : ''}`}>
                  <td className="p-3 font-medium text-stone-600 text-center border-r border-stone-100">{d}</td>
                  {userHabits.map(h => {
                      const isDone = entry?.habits?.[h.id];
                      return (
                        <td 
                            key={h.id} 
                            className="p-3 text-center border-r border-stone-100 cursor-pointer hover:bg-black/5 transition-colors select-none"
                            onClick={() => {
                                const currentHabits = entry?.habits || {};
                                updateDayData(dKey, {
                                    habits: { ...currentHabits, [h.id]: !currentHabits[h.id] }
                                });
                            }}
                        >
                            <span className={`font-bold text-lg ${isDone ? 'text-emerald-600' : 'text-stone-300'}`}>
                                {isDone ? 'X' : '-'}
                            </span>
                        </td>
                      );
                  })}
                  <td className="p-1 border-r border-stone-100 min-w-[200px]">
                      <input 
                        type="text" 
                        value={entry?.notes || ''}
                        onChange={(e) => updateDayData(dKey, { notes: e.target.value })}
                        placeholder="Add remark..."
                        title={entry?.notes || ''} 
                        className="w-full bg-transparent border-none focus:ring-1 focus:ring-amber-300 rounded px-2 py-1 text-sm text-stone-600 placeholder:text-stone-300 truncate"
                      />
                  </td>
              </tr>
          );
      }
      
      return (
          <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[800px] border-collapse">
                  <thead>
                      <tr className="bg-stone-100 border-b border-stone-200 text-stone-600 text-sm uppercase tracking-wider">
                          <th className="p-3 font-bold border-r border-stone-200 w-16 sticky left-0 bg-stone-100 z-10 print:static">Date</th>
                          {userHabits.map(h => (
                              <th key={h.id} className="p-2 font-bold border-r border-stone-200 align-bottom relative" style={{ maxWidth: '50px' }}>
                                 {/* Increased Height and Vertical Layout */}
                                 <div className="flex flex-col items-center justify-end h-48 pb-2">
                                    <span className="text-xl mb-2">{h.icon}</span>
                                    <div className="writing-mode-vertical rotate-180 text-xs tracking-wider leading-6 text-center whitespace-normal w-8 break-words flex items-center justify-center">
                                      {h.name}
                                    </div>
                                 </div>
                              </th>
                          ))}
                          <th className="p-3 font-bold text-left pl-4 min-w-[200px]">Remarks</th>
                      </tr>
                  </thead>
                  <tbody>
                      {rows}
                  </tbody>
              </table>
          </div>
      );
  };

  if (!isLoaded) return null; 

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans p-4 md:p-8 flex items-center justify-center relative print:p-0 print:bg-white">
      <style>
        {`
          .writing-mode-vertical {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
          }
          @media print {
            @page { size: landscape; margin: 1cm; }
            .no-print { display: none !important; }
            .print\\:overflow-visible { overflow: visible !important; }
            .print\\:static { position: static !important; }
            .print\\:bg-white { background-color: white !important; }
            .print\\:p-0 { padding: 0 !important; }
          }
        `}
      </style>
      
      {/* Backup Warning Notification */}
      {showBackupWarning && (
        <div className="fixed top-0 left-0 w-full bg-amber-100 border-b border-amber-200 px-4 py-2 z-[60] flex items-center justify-center gap-3 text-sm text-amber-800 shadow-sm no-print">
          <AlertCircle size={16} />
          <span>It's been over 7 days since your last backup!</span>
          <button 
             onClick={() => openSettings('data')}
             className="underline font-bold hover:text-amber-900"
          >
            Backup Now
          </button>
          <button onClick={() => setShowBackupWarning(false)} className="ml-4 text-amber-600 hover:text-amber-800">
             <X size={16} />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {statusMsg && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[60] bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce no-print">
          <CheckCircle2 size={20} />
          {statusMsg}
        </div>
      )}

      {/* Main Container - Stacked Layout (Mobile UI Style) */}
      <div className="max-w-4xl w-full h-full flex flex-col gap-6 print:block print:h-auto">
        
        {/* TOP NAVIGATION BAR */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-stone-200 flex flex-col items-center gap-4 sticky top-6 z-20 no-print">
            <div className="flex items-center gap-4 w-full justify-between">
               <div className="flex items-center gap-3">
                 {/* Avatar replaced the book logo here */}
                 <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center overflow-hidden border border-stone-200 shadow-sm">
                    <img src={DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h1 className="text-xl font-serif text-stone-800 font-bold leading-tight">Journal 26</h1>
                   <div className="text-xs text-stone-500">Hello, {userName}</div>
                 </div>
               </div>
            </div>

            {/* UPDATED HORIZONTAL NAV */}
            <div className="flex flex-row items-center gap-1 bg-stone-100 p-1 rounded-lg w-full">
                <button 
                  onClick={() => setView('daily')}
                  className={`flex-1 py-2 px-1 rounded-md text-[10px] font-bold uppercase tracking-tighter text-center transition-all
                    ${view === 'daily' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                  title="Daily Entry"
                >
                  Daily Entry
                </button>
                <button 
                  onClick={() => setView('summary')}
                  className={`flex-1 py-2 px-1 rounded-md text-[10px] font-bold uppercase tracking-tighter text-center transition-all
                    ${view === 'summary' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                  title="Summary View"
                >
                  Journal
                </button>
                <button 
                  onClick={() => setView('calendar')}
                  className={`flex-1 py-2 px-1 rounded-md text-[10px] font-bold uppercase tracking-tighter text-center transition-all
                    ${view === 'calendar' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}
                  title="Calendar"
                >
                  Calendar
                </button>
                <div className="w-px h-4 bg-stone-300 mx-1"></div>
                <button 
                  onClick={() => openSettings('profile')}
                  className="px-2 py-2 rounded-md text-stone-500 hover:text-stone-800 hover:bg-white/50 transition-all"
                  title="Settings"
                >
                  <Settings size={16} />
                </button>
            </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden flex-1 relative print:shadow-none print:border-none min-h-[600px] flex flex-col">
          
          <div className="flex-1 flex flex-col h-full overflow-hidden print:overflow-visible print:h-auto">
            
            {/* VIEW 1: CALENDAR */}
            {view === 'calendar' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif text-stone-800 flex items-center gap-3">
                        <CalendarIcon className="text-amber-500" />
                        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} className="text-stone-400" />
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ChevronRight size={24} className="text-stone-400" />
                        </button>
                    </div>
                </div>
                {renderCalendar()}
                </div>
            )}

            {/* VIEW 2: DAILY ENTRY */}
            {view === 'daily' && (
                <div className="flex flex-col h-full">
                <div className="p-8 border-b border-stone-100 bg-white">
                    <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-amber-600 font-bold tracking-wide text-sm mb-1 uppercase">
                        {WEEKDAYS[currentDate.getDay()]}
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={() => changeDay(-1)} className="text-stone-300 hover:text-stone-600 transition-colors p-1 -ml-2">
                                <ChevronLeft size={32} />
                            </button>
                            <h2 className="text-4xl font-serif text-stone-800 min-w-[240px] text-center">
                            {MONTHS[currentDate.getMonth()]} {currentDate.getDate()}
                            </h2>
                            <button onClick={() => changeDay(1)} className="text-stone-300 hover:text-stone-600 transition-colors p-1">
                                <ChevronRight size={32} />
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-stone-400 font-medium uppercase">Daily Rating</span>
                        <div className="flex bg-stone-100 p-1 rounded-lg gap-0.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                            const isActive = currentEntry.mood === num;
                            let bgClass = isActive ? 'bg-stone-800 text-white' : 'hover:bg-stone-200 text-stone-500';
                            if (isActive) {
                            if (num <= 4) bgClass = 'bg-rose-500 text-white';
                            else if (num <= 7) bgClass = 'bg-amber-400 text-white';
                            else bgClass = 'bg-emerald-500 text-white';
                            }
                            
                            return (
                            <button
                                key={num}
                                onClick={() => updateEntry({ mood: num })}
                                className={`w-7 h-8 rounded text-xs font-bold transition-all ${bgClass}`}
                            >
                                {num}
                            </button>
                            );
                        })}
                        </div>
                    </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="space-y-4">
                        <h3 className="text-lg font-serif text-stone-800 flex items-center gap-2">
                            <Trophy size={18} className="text-amber-500" />
                            Today's Tasks
                        </h3>
                        
                        <div className="bg-amber-50/50 rounded-lg p-4 border border-amber-100 space-y-3">
                            <div className="relative">
                                <input
                                type="text"
                                placeholder="Add a new task..."
                                className="w-full bg-white border-0 rounded-md py-2.5 pl-3 pr-10 shadow-sm ring-1 ring-inset ring-stone-200 focus:ring-2 focus:ring-amber-300 text-stone-700 placeholder:text-stone-400 sm:text-sm sm:leading-6"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                    addTask(e.target.value);
                                    e.target.value = '';
                                    }
                                }}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <Plus size={16} className="text-stone-400" />
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                {(currentEntry.tasks || []).length === 0 && (
                                <div className="text-center py-6 text-stone-400 text-sm">No tasks yet.</div>
                                )}
                                {(currentEntry.tasks || []).map(task => (
                                <div key={task.id} className="group flex items-center gap-3 bg-white p-3 rounded-md border border-stone-100 shadow-sm transition-all hover:shadow-md">
                                    <button 
                                    onClick={() => toggleTask(task.id)}
                                    className={`flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-stone-300 hover:text-emerald-400'}`}
                                    >
                                    {task.completed ? <CheckCircle2 size={22} className="fill-emerald-50" /> : <Circle size={22} />}
                                    </button>
                                    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                                    {task.text}
                                    </span>
                                    <button 
                                    onClick={() => deleteTask(task.id)}
                                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-400 transition-opacity p-1"
                                    >
                                    <Trash2 size={16} />
                                    </button>
                                </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-serif text-stone-800 flex items-center gap-2">
                                <CheckSquare size={18} className="text-amber-500" />
                                Daily Habits
                            </h3>
                            <button 
                                onClick={() => openSettings('habits')}
                                className="text-xs text-stone-400 hover:text-amber-600 font-medium flex items-center gap-1 transition-colors bg-stone-50 px-2 py-1 rounded-md"
                            >
                                <Settings size={12} /> Customize
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {userHabits.map(habit => {
                            const isCompleted = currentEntry.habits?.[habit.id];
                            return (
                                <button
                                key={habit.id}
                                onClick={() => toggleHabit(habit.id)}
                                className={`
                                    relative overflow-hidden p-3 rounded-lg border text-left transition-all duration-300 h-full
                                    ${isCompleted 
                                    ? 'bg-emerald-50 border-emerald-200 shadow-inner' 
                                    : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-md'
                                    }
                                `}
                                >
                                <div className="flex items-center gap-3 z-10 relative">
                                    <span className="text-2xl">{habit.icon}</span>
                                    <div>
                                    <div className={`text-sm font-medium ${isCompleted ? 'text-emerald-800' : 'text-stone-700'}`}>
                                        {habit.name}
                                    </div>
                                    <div className={`text-xs ${isCompleted ? 'text-emerald-600' : 'text-stone-400'}`}>
                                        {isCompleted ? 'Done' : 'Pending'}
                                    </div>
                                    </div>
                                </div>
                                {isCompleted && (
                                    <div className="absolute bottom-0 right-0 p-2 text-emerald-200">
                                    <CheckCircle2 size={40} className="opacity-20" />
                                    </div>
                                )}
                                </button>
                            );
                            })}
                        </div>
                    </div>
                    </div>

                    <section className="flex flex-col pt-4 border-t border-stone-100">
                    <h3 className="text-lg font-serif text-stone-800 mb-4 flex items-center gap-2">
                        <PenLine size={18} className="text-amber-500" />
                        Reflections
                    </h3>
                    <div className="relative w-full">
                        <textarea
                        value={currentEntry.notes}
                        onChange={(e) => updateEntry({ notes: e.target.value })}
                        placeholder="Write your thoughts here..."
                        className="w-full h-80 bg-white border border-stone-200 rounded-lg p-8 text-stone-700 font-mono text-base leading-loose resize-none focus:outline-none focus:ring-2 focus:ring-amber-200 shadow-sm"
                        style={{ lineHeight: '32px' }}
                        />
                    </div>
                    </section>
                </div>
                </div>
            )}

            {/* VIEW 3: SUMMARY TABLE */}
            {view === 'summary' && (
              <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col print:p-0 print:overflow-visible">
                 <div className="flex items-center justify-between mb-6 print:mb-4">
                    <div>
                        <h2 className="text-3xl font-serif text-stone-800 mb-1">{MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                        <div className="text-stone-400 text-sm font-medium uppercase tracking-widest">Monthly Journal</div>
                    </div>
                    <div className="flex items-center gap-2 no-print">
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={24} className="text-stone-400" />
                        </button>
                        <button 
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <ChevronRight size={24} className="text-stone-400" />
                        </button>
                    </div>
                 </div>

                 <div className="flex-1 bg-white border border-stone-200 shadow-sm rounded-xl overflow-hidden mb-4 print:border-none print:shadow-none">
                    {renderSummaryTable()}
                 </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* UNIFIED SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50">
              <h2 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
                <Settings className="text-stone-500" size={20} /> Settings
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-stone-400 hover:text-stone-700">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-100">
                <button 
                  onClick={() => setActiveSettingsTab('profile')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSettingsTab === 'profile' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  Profile
                </button>
                <button 
                  onClick={() => setActiveSettingsTab('habits')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSettingsTab === 'habits' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  Habits
                </button>
                <button 
                  onClick={() => setActiveSettingsTab('data')}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${activeSettingsTab === 'data' ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50' : 'text-stone-500 hover:bg-stone-50'}`}
                >
                  Data
                </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                
                {/* PROFILE TAB */}
                {activeSettingsTab === 'profile' && (
                   <div className="space-y-4">
                      <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-stone-100 rounded-full mx-auto flex items-center justify-center text-stone-300 mb-2 overflow-hidden">
                           <img src={DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <h3 className="text-stone-800 font-bold">Your Profile</h3>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Display Name</label>
                        <input 
                           type="text" 
                           value={userName}
                           onChange={(e) => setUserName(e.target.value)}
                           className="w-full border border-stone-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-amber-200 outline-none text-stone-700"
                           placeholder="Enter your name..."
                        />
                        <p className="text-xs text-stone-400 mt-2">This name will be displayed on your journal dashboard.</p>
                      </div>
                   </div>
                )}

                {/* HABITS TAB */}
                {activeSettingsTab === 'habits' && (
                   <div className="space-y-6">
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {userHabits.map((habit, idx) => (
                            <div key={habit.id} className="flex items-center justify-between p-2 hover:bg-stone-50 rounded-md bg-white border border-stone-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="bg-stone-100 p-1 rounded text-lg">{habit.icon}</span>
                                <span className="text-stone-700 font-medium">{habit.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => startEditingHabit(habit)}
                                    className="text-stone-300 hover:text-amber-500 p-2"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <div className="flex flex-col mr-2">
                                    <button 
                                        disabled={idx === 0}
                                        onClick={() => moveHabit(idx, 'up')}
                                        className="p-0.5 text-stone-400 hover:text-amber-600 disabled:opacity-30"
                                    >
                                        <ChevronUp size={14} />
                                    </button>
                                    <button 
                                        disabled={idx === userHabits.length - 1}
                                        onClick={() => moveHabit(idx, 'down')}
                                        className="p-0.5 text-stone-400 hover:text-amber-600 disabled:opacity-30"
                                    >
                                        <ChevronDown size={14} />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => deleteHabitSafe(habit.id)}
                                    className="text-stone-300 hover:text-red-500 p-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            </div>
                        ))}
                      </div>

                      <div className="bg-stone-50 p-4 rounded-lg border border-stone-100">
                          <h4 className="text-xs font-bold text-stone-500 uppercase mb-3">
                              {editingHabitId ? 'Edit Habit' : 'Add New Habit'}
                          </h4>
                          
                          {/* Icon Picker */}
                          <div className="mb-4">
                             <label className="block text-xs text-stone-400 mb-2">Choose Icon</label>
                             <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar border border-stone-200 rounded-md p-2 bg-white">
                                {EMOJI_OPTIONS.map(emoji => (
                                    <button 
                                      key={emoji}
                                      onClick={() => setHabitIconInput(emoji)}
                                      className={`w-8 h-8 flex items-center justify-center rounded-md text-lg hover:bg-amber-100 transition-colors ${habitIconInput === emoji ? 'bg-amber-100 ring-2 ring-amber-300' : ''}`}
                                    >
                                      {emoji}
                                    </button>
                                ))}
                             </div>
                          </div>

                          <div className="flex gap-2">
                            <div className="w-12 h-10 flex items-center justify-center bg-white border border-stone-300 rounded-md text-xl shadow-sm">
                               {habitIconInput}
                            </div>
                            <input 
                                type="text" 
                                value={habitNameInput} 
                                onChange={e => setHabitNameInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveHabit();
                                }}
                                className="flex-1 border rounded-md border-stone-300 px-3 py-2 focus:ring-2 focus:ring-amber-300 outline-none"
                                placeholder="Habit name (e.g., Read Book)..."
                            />
                            <button 
                                onClick={saveHabit}
                                className="bg-stone-800 text-white px-4 py-2 rounded-md hover:bg-stone-700 font-medium text-sm"
                            >
                                {editingHabitId ? 'Update' : 'Add'}
                            </button>
                            {editingHabitId && (
                                <button 
                                    onClick={() => {
                                        setEditingHabitId(null);
                                        setHabitNameInput('');
                                        setHabitIconInput('✨');
                                    }}
                                    className="bg-stone-200 text-stone-600 px-3 py-2 rounded-md hover:bg-stone-300 font-medium text-sm"
                                >
                                    Cancel
                                </button>
                            )}
                          </div>
                      </div>
                   </div>
                )}

                {/* DATA TAB */}
                {activeSettingsTab === 'data' && (
                   <div className="space-y-4">
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 flex items-start gap-3">
                            <AlertCircle className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                            <div className="text-xs text-amber-800">
                                <strong>Important:</strong> Your data is stored locally in this browser. To ensure you don't lose your 2026 journal, please backup your data regularly.
                            </div>
                        </div>

                        {lastBackupDate && (
                            <div className="text-xs text-stone-400 mb-2">
                                Last Backup: {lastBackupDate.toLocaleDateString()}
                            </div>
                        )}

                        {/* Export JSON Section */}
                        <div className="border border-stone-200 rounded-lg p-4">
                            <h3 className="font-bold text-stone-700 mb-1 flex items-center gap-2">
                                <Download size={18} className="text-amber-500" /> Full Backup
                            </h3>
                            <p className="text-xs text-stone-500 mb-3">
                                Download a full copy of your journal (entries, habits, settings).
                            </p>
                            <button 
                                onClick={handleExport}
                                className="w-full bg-stone-50 border border-stone-300 text-stone-700 py-2 rounded-md hover:bg-white hover:border-amber-300 hover:text-amber-700 transition-colors text-sm font-medium"
                            >
                                Download Backup (.json)
                            </button>
                        </div>

                        {/* Import Section */}
                        <div className="border border-stone-200 rounded-lg p-4">
                            <h3 className="font-bold text-stone-700 mb-1 flex items-center gap-2">
                                <Upload size={18} className="text-emerald-500" /> Restore Data
                            </h3>
                            <p className="text-xs text-stone-500 mb-3">
                                Upload a previously saved JSON backup file. <span className="text-red-500">This will overwrite current data.</span>
                            </p>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".json"
                                className="hidden" 
                            />
                            <button 
                                onClick={handleImportClick}
                                className="w-full bg-stone-50 border border-stone-300 text-stone-700 py-2 rounded-md hover:bg-white hover:border-emerald-300 hover:text-emerald-700 transition-colors text-sm font-medium"
                            >
                                Upload Backup File
                            </button>
                        </div>
                   </div>
                )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}