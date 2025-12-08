import React, { useState, useEffect, useMemo } from 'react';
import { Target, TrendingUp, Calendar, DollarSign, Lightbulb, LogIn, LogOut, MessageCircle } from 'lucide-react';
import { Sale, SaleCategory, CAMPAIGN_GOAL, CAMPAIGN_WEEKS, WEEKLY_GOAL, WeeklySummary } from './types';
import { generateMotivationalTip } from './services/geminiService';
import { SalesChart } from './components/SalesChart';
import { SalesEntry } from './components/SalesEntry';
import { SalesHistory } from './components/SalesHistory';
import { ChatBot } from './components/ChatBot';

// Helper to determine date ranges
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust so 0 (Sunday) is start
  return new Date(d.setDate(diff));
};

// WhatsApp Configuration
const WHATSAPP_NUMBER = "525652146268"; // Added country code 52 for Mexico based on length
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20necesito%20ayuda%20con%20la%20app%20Meta%201%20Millón`;

const App: React.FC = () => {
  // --- User State (Mock Auth) ---
  const [user, setUser] = useState<{ name: string; email: string; photo: string } | null>(() => {
    const savedUser = localStorage.getItem('app_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = () => {
    // Simulating Google Login
    const mockUser = {
      name: "Usuario Emprendedor",
      email: "usuario@gmail.com",
      photo: "https://lh3.googleusercontent.com/a/default-user=s96-c"
    };
    setUser(mockUser);
    localStorage.setItem('app_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  // --- State ---
  // Start date initialized to the start of the current week (Today/Sunday)
  const [campaignStartDate] = useState<Date>(() => {
    return getStartOfWeek(new Date());
  });

  // Load sales from LocalStorage or use default
  const [sales, setSales] = useState<Sale[]>(() => {
    const savedSales = localStorage.getItem('sales_data');
    if (savedSales) {
      return JSON.parse(savedSales);
    }
    return [
      { 
        id: '1', 
        date: new Date().toISOString().split('T')[0], 
        description: 'Sala Modular - Ejemplo', 
        category: SaleCategory.PRODUCT, 
        amount: 50000,
        fabric: 'Lino',
        color: 'Gris Oxford',
        clientName: 'Juan Pérez',
        phone: '555-0123',
        address: 'Av. Principal 123'
      },
    ];
  });

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [aiTip, setAiTip] = useState<string>("Analizando tu rendimiento...");
  const [loadingTip, setLoadingTip] = useState(false);

  // --- Persistence Effect ---
  useEffect(() => {
    localStorage.setItem('sales_data', JSON.stringify(sales));
  }, [sales]);

  // --- Derived State & Calculations ---

  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + curr.amount, 0), [sales]);
  const progressPercentage = Math.min((totalSales / CAMPAIGN_GOAL) * 100, 100);

  // Animation State for Progress Bar
  const [displayedProgress, setDisplayedProgress] = useState(0);

  useEffect(() => {
    // Timeout to trigger animation after mount or update
    const timer = setTimeout(() => {
      setDisplayedProgress(progressPercentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  // Calculate Weekly Summaries
  const weeklyData = useMemo<WeeklySummary[]>(() => {
    const summaries: WeeklySummary[] = [];
    
    for (let i = 0; i < CAMPAIGN_WEEKS; i++) {
      const weekStart = new Date(campaignStartDate);
      weekStart.setDate(weekStart.getDate() + (i * 7));
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      // Filter sales in this range
      const weekTotal = sales
        .filter(s => s.date >= startStr && s.date <= endStr)
        .reduce((acc, curr) => acc + curr.amount, 0);

      summaries.push({
        weekNumber: i + 1,
        startDate: startStr,
        endDate: endStr,
        total: weekTotal,
        goal: WEEKLY_GOAL
      });
    }
    return summaries;
  }, [sales, campaignStartDate]);

  // Days remaining calculation
  const daysRemaining = useMemo(() => {
    const endDate = new Date(campaignStartDate);
    endDate.setDate(endDate.getDate() + (CAMPAIGN_WEEKS * 7));
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    // If diffTime is negative, campaign is over, return 0. Use ceil to count today.
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays < 0 ? 0 : diffDays;
  }, [campaignStartDate]);

  // Detailed Breakdown for AI Context
  const categoryStats = useMemo(() => {
    const product = sales.filter(s => s.category === SaleCategory.PRODUCT).reduce((a, b) => a + b.amount, 0);
    const service = sales.filter(s => s.category === SaleCategory.SERVICE).reduce((a, b) => a + b.amount, 0);
    return { product, service };
  }, [sales]);

  // Enhanced Context Data for Gemini 3 Pro
  const contextData = useMemo(() => {
    return `
      REPORTE EN TIEMPO REAL - APP META 1 MILLÓN:
      
      1. ESTADO GENERAL DE LA META ($1M en 4 semanas):
         - Total Recaudado: $${totalSales.toLocaleString()}
         - Progreso Global: ${progressPercentage.toFixed(2)}%
         - Monto Restante: $${(CAMPAIGN_GOAL - totalSales).toLocaleString()}
         - Días Restantes: ${daysRemaining}
      
      2. DESGLOSE POR TIPO DE INGRESO:
         - Productos: $${categoryStats.product.toLocaleString()}
         - Servicios: $${categoryStats.service.toLocaleString()}
      
      3. RENDIMIENTO SEMANAL DETALLADO (Meta por semana: $${WEEKLY_GOAL.toLocaleString()}):
         ${weeklyData.map(w => `- Semana ${w.weekNumber} (${w.startDate} a ${w.endDate}): $${w.total.toLocaleString()} [${w.total >= WEEKLY_GOAL ? '✅ CUMPLIDO' : '⚠️ BAJO LA META'}]`).join('\n         ')}
      
      4. ÚLTIMAS 8 TRANSACCIONES (Para análisis de tendencias de compra):
         ${sales.slice(0, 8).map(s => `- ${s.date}: ${s.description} | $${s.amount.toLocaleString()} | Cat: ${s.category} | Cliente: ${s.clientName || 'N/A'}`).join('\n         ')}
    `;
  }, [totalSales, progressPercentage, daysRemaining, sales, categoryStats, weeklyData]);


  // --- Effects ---

  // Update AI Tip when sales change noticeably (debounced or just on mount/major change)
  useEffect(() => {
    const fetchTip = async () => {
      if (!user) return; // Don't fetch if not logged in
      setLoadingTip(true);
      const tip = await generateMotivationalTip(totalSales, CAMPAIGN_GOAL, daysRemaining);
      setAiTip(tip);
      setLoadingTip(false);
    };

    // Only fetch if we have an API key (handled in service) and debounce slightly
    const timer = setTimeout(() => {
        fetchTip();
    }, 1000);

    return () => clearTimeout(timer);
  }, [totalSales, daysRemaining, user]);

  // --- Handlers ---

  const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
    const saleWithId = { ...newSale, id: crypto.randomUUID() };
    setSales(prev => [...prev, saleWithId]);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    setSales(prev => prev.map(s => s.id === updatedSale.id ? updatedSale : s));
    setEditingSale(null);
    // Scroll to top to see feedback or just reset form
  };

  const handleDeleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
    if (editingSale?.id === id) {
      setEditingSale(null);
    }
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
  };

  // --- Render Login Screen if not authenticated ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Meta 1 Millón</h1>
          <p className="text-gray-500 mb-8">Inicia sesión para guardar tu progreso, sincronizar tus ventas y alcanzar tus objetivos.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 4.63c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>
          
          <p className="mt-6 text-xs text-gray-400">
            Tus datos se guardarán localmente en este dispositivo de forma segura.
          </p>
        </div>
      </div>
    );
  }

  // --- Main Application ---
  return (
    <div className="min-h-screen pb-12 relative">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-700 rounded-lg">
                    <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Meta 1 Millón</h1>
                  <p className="text-indigo-200 text-xs hidden sm:block">Sistema de Monitoreo de Ventas</p>
                </div>
             </div>
             
             {/* Mobile User Menu (Visible only on small screens) */}
             <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-bold border border-indigo-500">
                  {user.name.charAt(0)}
                </div>
                <button onClick={handleLogout} className="text-indigo-300 hover:text-white">
                  <LogOut className="w-5 h-5" />
                </button>
             </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium w-full md:w-auto justify-between md:justify-end">
            <div className="flex flex-col items-end">
               <span className="text-indigo-300">Meta Global</span>
               <span className="text-xl font-bold">${CAMPAIGN_GOAL.toLocaleString()}</span>
            </div>
            <div className="h-8 w-px bg-indigo-700 hidden md:block"></div>
            <div className="flex flex-col items-end">
               <span className="text-indigo-300">Días Restantes</span>
               <span className="text-xl font-bold flex items-center gap-1">
                 <Calendar className="w-4 h-4" /> {daysRemaining}
               </span>
            </div>
            
            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-indigo-800">
               <div className="text-right hidden lg:block">
                  <p className="text-xs text-indigo-300">Hola,</p>
                  <p className="text-sm font-semibold leading-tight">{user.name.split(' ')[0]}</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-indigo-900 font-bold shadow-sm">
                  {user.name.charAt(0)}
               </div>
               <button 
                onClick={handleLogout}
                className="p-2 hover:bg-indigo-800 rounded-lg transition-colors text-indigo-300 hover:text-white"
                title="Cerrar Sesión"
               >
                 <LogOut className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Accumulated */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Recaudado Total</p>
              <h2 className="text-3xl font-bold text-gray-900">${totalSales.toLocaleString()}</h2>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                 <TrendingUp className="w-3 h-3" /> 
                 {progressPercentage.toFixed(1)}% de la meta
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

           {/* Weekly Pace */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Promedio Semanal Actual</p>
              <h2 className="text-3xl font-bold text-gray-900">
                ${(totalSales / CAMPAIGN_WEEKS).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h2>
               <p className="text-xs text-gray-400 mt-2">
                 Meta: ${WEEKLY_GOAL.toLocaleString()} / sem
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-full">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

           {/* AI Insight */}
           <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-indigo-200">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Consejo IA</span>
              </div>
              <p className="text-sm font-medium italic leading-relaxed">
                "{loadingTip ? 'Consultando estrategia...' : aiTip}"
              </p>
            </div>
            {/* Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Target className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
           <div className="flex justify-between items-end mb-2">
             <span className="font-semibold text-gray-700">Progreso Total</span>
             <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Meta: $1M</span>
                <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                    {progressPercentage.toFixed(1)}%
                </span>
             </div>
           </div>
           <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden shadow-inner border border-gray-200 p-0.5">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 shadow-sm relative transition-all duration-[1500ms] ease-out flex items-center justify-end pr-2" 
                style={{ width: `${displayedProgress}%` }}
              >
                  {/* Shine/Glare effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent"></div>
                  
                  {/* Leading edge highlight */}
                  {displayedProgress > 5 && (
                    <div className="h-full w-px bg-white/50 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                  )}
              </div>
           </div>
           <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
             <span>Inicio</span>
             <span>$250k</span>
             <span>$500k</span>
             <span>$750k</span>
             <span>$1M</span>
           </div>
        </div>

        {/* Sales Entry Form (Handles Add and Edit) */}
        <SalesEntry 
          onAddSale={handleAddSale} 
          onUpdateSale={handleUpdateSale}
          editingSale={editingSale}
          onCancelEdit={handleCancelEdit}
        />

        {/* Charts Section */}
        <SalesChart weeklyData={weeklyData} />

        {/* History Table */}
        <SalesHistory 
          sales={sales} 
          onDeleteSale={handleDeleteSale} 
          onEditSale={handleEditClick}
        />

      </main>
      
      {/* Floating Buttons Container */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-40">
        
        {/* WhatsApp Button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all flex items-center justify-center hover:scale-110"
          title="Contactar soporte por WhatsApp"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>
      
      {/* WhatsApp Specific Fixed Button (Independent of container to avoid conflict with ChatBot's internal fixed pos) */}
      <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-24 right-6 p-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all z-40 flex items-center justify-center hover:scale-110 animate-in slide-in-from-bottom-10 fade-in duration-500"
          title="Soporte WhatsApp"
      >
          <MessageCircle className="w-6 h-6" />
      </a>

      {/* Floating ChatBot */}
      <ChatBot contextData={contextData} />
    </div>
  );
};

export default App;