import React, { useState, useMemo } from 'react';
import { Sale, SaleCategory } from '../types';
import { Search, Filter, Download, Trash2, Pencil, User, MapPin } from 'lucide-react';

interface SalesHistoryProps {
  sales: Sale[];
  onDeleteSale: (id: string) => void;
  onEditSale?: (sale: Sale) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, onDeleteSale, onEditSale }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredSales = useMemo(() => {
    return sales
      .filter((sale) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            sale.description.toLowerCase().includes(searchLower) ||
            sale.clientName?.toLowerCase().includes(searchLower) ||
            sale.fabric?.toLowerCase().includes(searchLower);
            
        const matchesCategory = filterCategory === 'All' || sale.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchTerm, filterCategory]);

  const handleExport = () => {
    // Generate CSV content
    const headers = ['ID,Fecha,Cliente,Teléfono,Dirección,Descripción,Categoría,Tela,Color,Importe'];
    const rows = filteredSales.map(s => 
      `${s.id},${s.date},"${s.clientName || ''}","${s.phone || ''}","${s.address || ''}","${s.description}",${s.category},"${s.fabric || ''}","${s.color || ''}",${s.amount}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_ventas_completo.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Historial de Transacciones</h3>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar (Cliente, Prod...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full bg-white appearance-none"
            >
              <option value="All">Todas las Categorías</option>
              <option value={SaleCategory.PRODUCT}>{SaleCategory.PRODUCT}</option>
              <option value={SaleCategory.SERVICE}>{SaleCategory.SERVICE}</option>
            </select>
          </div>

          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-medium rounded-lg hover:bg-green-100 transition text-sm whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 min-w-[800px]">
          <thead className="bg-gray-50 text-gray-900 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-3 w-28">Fecha</th>
              <th className="px-6 py-3">Cliente / Contacto</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Detalles</th>
              <th className="px-6 py-3 text-right">Importe</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No se encontraron ventas con los filtros actuales.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition group">
                  <td className="px-6 py-4 whitespace-nowrap align-top">{sale.date}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-900">{sale.clientName || 'Cliente General'}</div>
                    {(sale.phone || sale.address) && (
                        <div className="text-xs text-gray-400 mt-1 space-y-1">
                            {sale.phone && (
                              <div className="flex items-center gap-1 group-hover:text-gray-700 transition-colors">
                                <User className="w-3 h-3" /> 
                                {sale.phone}
                              </div>
                            )}
                            {sale.address && (
                              <div className="flex items-start gap-1 group-hover:text-gray-700 transition-colors">
                                <MapPin className="w-3 h-3 mt-0.5 shrink-0" /> 
                                <span className="truncate max-w-[150px] group-hover:max-w-xs group-hover:whitespace-normal group-hover:overflow-visible transition-all duration-200">
                                  {sale.address}
                                </span>
                              </div>
                            )}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-800">{sale.description}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium mt-1 ${
                      sale.category === SaleCategory.PRODUCT ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {sale.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top text-xs">
                    {(sale.fabric || sale.color) ? (
                        <div className="space-y-1">
                            {sale.fabric && <div><span className="text-gray-400">Tela:</span> {sale.fabric}</div>}
                            {sale.color && <div><span className="text-gray-400">Color:</span> {sale.color}</div>}
                        </div>
                    ) : (
                        <span className="text-gray-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900 align-top">
                    ${sale.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                   <td className="px-6 py-4 text-right align-top">
                    <div className="flex justify-end gap-2">
                      {onEditSale && (
                        <button
                          onClick={() => onEditSale(sale)}
                          className="text-gray-400 hover:text-indigo-600 transition p-1 rounded-md hover:bg-indigo-50"
                          title="Editar venta"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      <button
                          onClick={() => {
                              if(window.confirm('¿Estás seguro de que deseas eliminar esta venta?')) {
                                  onDeleteSale(sale.id);
                              }
                          }}
                          className="text-gray-400 hover:text-red-600 transition p-1 rounded-md hover:bg-red-50"
                          title="Eliminar venta"
                      >
                          <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};