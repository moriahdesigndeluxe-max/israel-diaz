import React, { useState, useEffect, useMemo } from 'react';
import { Target, TrendingUp, Calendar, DollarSign, Lightbulb } from 'lucide-react';
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

const App: React.FC = () => {
  // --- State ---
  // Start date initialized to the start of the current week (Today/Sunday)
  const [campaignStartDate] = useState<Date>(() => {
    return getStartOfWeek(new Date());
  });

  // Dummy data updated to be relevant to "today" with new fields
  const [sales, setSales] = useState<Sale[]>([
    { 
      id: '1', 
      date: new Date().toISOString().split('T')[0], 
      description: 'Sala Modular', 
      category: SaleCategory.PRODUCT, 
      amount: 50000,
      fabric: 'Lino',
      color: 'Gris Oxford',
      clientName: 'Juan Pérez',
      phone: '555-0123',
      address: 'Av. Principal 123'
    },
  ]);

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [aiTip, setAiTip] = useState<string>("Analizando tu rendimiento...");
  const [loadingTip, setLoadingTip] = useState(false);

  // --- Derived State & Calculations ---

  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + curr.amount, 0), [sales]);
  const progressPercentage = Math.min((totalSales / CAMPAIGN_GOAL) * 100, 100);

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

  // Context Data for ChatBot
  const contextData = useMemo(() => {
    return `
      Resumen Actual:
      - Ventas Totales: $${totalSales.toLocaleString()}
      - Progreso: ${progressPercentage.toFixed(1)}%
      - Meta Total: $${CAMPAIGN_GOAL.toLocaleString()}
      - Días Restantes: ${daysRemaining}
      - Ventas Recientes: ${sales.slice(0, 5).map(s => `${s.date}: ${s.description} ($${s.amount})`).join('; ')}
    `;
  }, [totalSales, progressPercentage, daysRemaining, sales]);


  // --- Effects ---

  // Update AI Tip when sales change noticeably (debounced or just on mount/major change)
  useEffect(() => {
    const fetchTip = async () => {
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
  }, [totalSales, daysRemaining]);

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

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-700 rounded-lg">
                <Target className="w-6 h-6 text-yellow-400" />
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight">Meta 1 Millón</h1>
               <p className="text-indigo-200 text-xs">Sistema de Monitoreo de Ventas</p>
             </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium">
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
             <span className="font-bold text-indigo-600">{progressPercentage.toFixed(1)}%</span>
           </div>
           <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-indigo-600 h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
           </div>
           <div className="flex justify-between mt-2 text-xs text-gray-400">
             <span>$0</span>
             <span>$500k</span>
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
      
      {/* Floating ChatBot */}
      <ChatBot contextData={contextData} />
    </div>
  );
};

export default App;