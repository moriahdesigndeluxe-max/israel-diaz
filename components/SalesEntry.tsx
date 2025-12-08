import React, { useState, useEffect } from 'react';
import { PlusCircle, Zap, Save, X, User, Home, Phone, Palette, Box, Scissors } from 'lucide-react';
import { SaleCategory, Sale } from '../types';

interface SalesEntryProps {
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onUpdateSale?: (sale: Sale) => void;
  editingSale?: Sale | null;
  onCancelEdit?: () => void;
}

export const SalesEntry: React.FC<SalesEntryProps> = ({ 
  onAddSale, 
  onUpdateSale, 
  editingSale, 
  onCancelEdit 
}) => {
  // Basic Info
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<SaleCategory>(SaleCategory.PRODUCT);
  
  // Product Details
  const [fabric, setFabric] = useState('');
  const [color, setColor] = useState('');

  // Client Info
  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  // Effect to populate form when editing
  useEffect(() => {
    if (editingSale) {
      setDate(editingSale.date);
      setDescription(editingSale.description);
      setAmount(editingSale.amount.toString());
      setCategory(editingSale.category);
      setFabric(editingSale.fabric || '');
      setColor(editingSale.color || '');
      setClientName(editingSale.clientName || '');
      setAddress(editingSale.address || '');
      setPhone(editingSale.phone || '');
    } else {
      resetForm();
    }
  }, [editingSale]);

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setAmount('');
    setCategory(SaleCategory.PRODUCT);
    setFabric('');
    setColor('');
    setClientName('');
    setAddress('');
    setPhone('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const saleData = {
      date,
      description,
      category,
      amount: parseFloat(amount),
      fabric,
      color,
      clientName,
      address,
      phone
    };

    if (editingSale && onUpdateSale) {
      onUpdateSale({ ...saleData, id: editingSale.id });
    } else {
      onAddSale(saleData);
    }

    if (!editingSale) {
      resetForm();
    }
  };

  const handleCancel = () => {
    if (onCancelEdit) onCancelEdit();
  };

  const fillQuickAction = (desc: string) => {
    setDescription(desc);
    setCategory(SaleCategory.PRODUCT);
  };

  const isEditing = !!editingSale;

  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border mb-8 transition-colors ${isEditing ? 'border-yellow-200 bg-yellow-50' : 'border-gray-100'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold flex items-center gap-2 ${isEditing ? 'text-yellow-800' : 'text-gray-800'}`}>
          {isEditing ? (
            <>
              <Save className="w-5 h-5" />
              Editar Venta
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Registrar Nueva Venta
            </>
          )}
        </h3>
        {isEditing && (
            <button 
              onClick={handleCancel}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm"
            >
              <X className="w-3 h-3" /> Cancelar Edición
            </button>
        )}
      </div>

      {!isEditing && (
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1 w-full sm:w-auto mb-2 sm:mb-0">
            <Zap className="w-4 h-4 text-yellow-500" /> Accesos Rápidos:
          </span>
          <button
            type="button"
            onClick={() => fillQuickAction("Sala Moriah de 3 reclinables")}
            className="text-xs bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-100 hover:border-indigo-300 px-3 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow font-medium flex-1 sm:flex-none text-center"
          >
            + Sala Moriah de 3 reclinables
          </button>
          <button
            type="button"
            onClick={() => fillQuickAction("Sofa cama relax plus")}
            className="text-xs bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-100 hover:border-indigo-300 px-3 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow font-medium flex-1 sm:flex-none text-center"
          >
            + Sofa cama relax plus
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Sale Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
           <div className="col-span-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Fecha</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</label>
            <div className="relative">
              <Box className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Ej. Sala Modular"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="col-span-1">
             <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Importe ($)</label>
             <input
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-900"
            />
          </div>
        </div>

        {/* Section 2: Product Details & Client (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
           {/* Product Details */}
           <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                 <Palette className="w-4 h-4 text-gray-400" /> Detalles del Producto
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs text-gray-500 mb-1">Categoría</label>
                   <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SaleCategory)}
                      className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value={SaleCategory.PRODUCT}>{SaleCategory.PRODUCT}</option>
                      <option value={SaleCategory.SERVICE}>{SaleCategory.SERVICE}</option>
                    </select>
                </div>
                <div>
                   <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                     <Scissors className="w-3 h-3" /> Tipo de Tela
                   </label>
                   <input
                      type="text"
                      placeholder="Ej. Lino, Terciopelo"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="col-span-2">
                   <label className="block text-xs text-gray-500 mb-1">Color</label>
                   <input
                      type="text"
                      placeholder="Ej. Gris Oxford, Beige"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
              </div>
           </div>

           {/* Client Info */}
           <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                 <User className="w-4 h-4 text-gray-400" /> Datos del Cliente
              </h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Nombre del Cliente"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs text-gray-500 mb-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Teléfono"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-7 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs text-gray-500 mb-1">Dirección</label>
                    <div className="relative">
                      <Home className="absolute left-2 top-2.5 w-3 h-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Calle, Número, Col."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-7 rounded-lg border-gray-300 border p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="flex justify-end pt-4">
           {isEditing && (
             <button
                type="button"
                onClick={handleCancel}
                className="mr-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
             >
                Cancelar
             </button>
           )}
           <button
              type="submit"
              className={`font-medium py-2 px-8 rounded-lg transition shadow-md hover:shadow-lg flex items-center gap-2 ${
                  isEditing 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isEditing ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              {isEditing ? 'Actualizar' : 'Guardar Venta'}
            </button>
        </div>
      </form>
    </div>
  );
};