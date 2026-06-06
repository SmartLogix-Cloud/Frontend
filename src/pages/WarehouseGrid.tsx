import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Warehouse, 
  AlertTriangle, 
  Trash2,
  Grid
} from 'lucide-react';
import { Product } from '../types';

interface WarehouseGridProps {
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProductStock: (id: string, newQty: number) => void;
  onDeleteProduct: (id: string) => void;
}

export default function WarehouseGrid({ products, onAddProduct, onUpdateProductStock, onDeleteProduct }: WarehouseGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form states to add high fidelity item
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<'Electrónica' | 'Farmacéutico' | 'Automotriz' | 'Perecederos' | 'General'>('General');
  const [formQty, setFormQty] = useState(100);
  const [formMinStock, setFormMinStock] = useState(15);
  const [formLocation, setFormLocation] = useState('Pasillo A - Estante B3');

  // Categories list
  const categories = ['Todos', 'Electrónica', 'Farmacéutico', 'Automotriz', 'Perecederos', 'General'];

  // Filters
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const generateSKU = (cat: string) => {
    const prefix = cat.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}-SL`;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    const sku = generateSKU(formCategory);
    const newProd: Product = {
      id: Math.random().toString(36).substring(7),
      name: formName,
      sku: sku,
      category: formCategory,
      quantity: Number(formQty),
      minStock: Number(formMinStock),
      location: formLocation,
      status: Number(formQty) <= 0 ? 'Agotado' : Number(formQty) <= Number(formMinStock) ? 'Bajo Stock' : 'Disponible',
      lastUpdated: new Date().toISOString().substring(0, 10)
    };

    onAddProduct(newProd);
    
    // Clear
    setFormName('');
    setIsAddingMode(false);
  };

  const handleAdjustStock = (amount: number) => {
    if (!selectedProduct) return;
    const currentQty = selectedProduct.quantity;
    const nextQty = Math.max(0, currentQty + amount);
    onUpdateProductStock(selectedProduct.id, nextQty);
    
    // Sync selected
    setSelectedProduct(prev => {
      if (!prev) return null;
      return {
        ...prev,
        quantity: nextQty,
        status: nextQty <= 0 ? 'Agotado' : nextQty <= prev.minStock ? 'Bajo Stock' : 'Disponible'
      };
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Board */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#006a61]">ALMACENES INTELIGENTES</span>
          <h2 className="text-xl font-extrabold text-[#0b1c30] mt-0.5">Gestión de Stock y Racks de Carga</h2>
          <p className="text-slate-500 text-xs mt-0.5">Navega a través de las estanterías físicas digitales, audita lotes y añade inventarios corporativos.</p>
        </div>
        
        <button 
          onClick={() => setIsAddingMode(!isAddingMode)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-900 border border-slate-200 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>Ingresar Lote de Stock</span>
        </button>
      </div>

      {/* Adding Module Form */}
      {isAddingMode && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4 animate-fadeIn">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Plus size={16} className="text-[#006a61]" />
              Formulario de Ingreso de Lote nuevo (Recepción de Carga)
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAddingMode(false)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Input 1 name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">NOMBRE DEL PRODUCTO</label>
              <input 
                type="text"
                placeholder="ej. Sensores Láser LiDAR"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Input 2 category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">CATEGORÍA</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-2 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none bg-white font-semibold"
              >
                <option value="General">General</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Farmacéutico">Farmacéutico</option>
                <option value="Automotriz">Automotriz</option>
                <option value="Perecederos">Perecederos</option>
              </select>
            </div>

            {/* Input 3 quantity */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">CANTIDAD INICIAL</label>
              <input 
                type="number"
                min="0"
                value={formQty}
                onChange={(e) => setFormQty(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Input 4 Min stock alert */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">STOCK MÍNIMO (ALERTA)</label>
              <input 
                type="number"
                min="0"
                value={formMinStock}
                onChange={(e) => setFormMinStock(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

            {/* Input 5 Location */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">UBICACIÓN ESPACIAL</label>
              <input 
                type="text"
                placeholder="ej. Pasillo D - Stand 12"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              />
            </div>

          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              className="bg-[#006a61] hover:bg-[#005049] text-white px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Registrar y Ubicar en Rack</span>
            </button>
          </div>
        </form>
      )}

      {/* Grid Filter Options & Search */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch justify-between">
        
        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg self-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-white text-slate-900 shadow-xs font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Buscar por SKU, nombre, rack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none bg-white placeholder:text-slate-400"
          />
        </div>

      </div>

      {/* Shelf rack interactive map plus product details drawer layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rack shelf layout graphics (Col-span 2) */}
        <div className="bg-white p-5 rounded-xl border border-[#e2e8f0] shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Mapa de Rack Virtualizado</h3>
              <p className="text-[11px] text-slate-400">Presiona cualquier slot para cambiar la carga y ver propiedades del material</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#006a61] rounded"></span>
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded"></span>
                <span>Bajo Stock</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded"></span>
                <span>Agotado</span>
              </div>
            </div>
          </div>

          {/* Visual representations of Racks */}
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-h-[380px] flex flex-col justify-between">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((p) => {
                let badgeClr = 'bg-[#006a61]';
                let borderClr = 'border-[#006a61]/20 hover:border-[#006a61] hover:bg-[#006a61]/5';
                
                if (p.status === 'Bajo Stock') {
                  badgeClr = 'bg-amber-500';
                  borderClr = 'border-amber-500/20 hover:border-amber-500 hover:bg-amber-50';
                } else if (p.status === 'Agotado') {
                  badgeClr = 'bg-rose-500';
                  borderClr = 'border-rose-500/20 hover:border-rose-500 hover:bg-rose-50';
                }

                const isSelected = selectedProduct?.id === p.id;

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3.5 bg-white border rounded-xl text-left transition-all relative flex flex-col justify-between h-28 cursor-pointer ${borderClr} ${
                      isSelected ? 'ring-2 ring-slate-900 shadow-md border-transparent' : 'shadow-xs'
                    }`}
                  >
                    {/* Top block shelf level */}
                    <div className="w-full space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{p.sku}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${badgeClr}`}></span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 truncate pr-2" title={p.name}>{p.name}</h4>
                    </div>

                    {/* Quantity & Location */}
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-baseline text-xs">
                        <span className="text-[10px] text-slate-400">Cant:</span>
                        <span className="font-bold text-slate-900">{p.quantity} <span className="text-[10px] text-slate-400 font-normal">u.</span></span>
                      </div>
                      <div className="flex justify-between items-baseline text-[10px]">
                        <span className="text-slate-400">Rack:</span>
                        <span className="font-semibold text-slate-500 truncate max-w-[120px]">{p.location.split(' - ')[1] || p.location}</span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
                  <Warehouse size={40} className="text-slate-300 stroke-1" />
                  <p className="text-xs font-medium">No se encontraron productos en esta sección.</p>
                </div>
              )}
            </div>

            <div className="mt-6 p-3.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Grid size={14} className="text-[#006a61]" />
                <span>Mostrando <strong>{filteredProducts.length}</strong> lotes en estanterías según filtros.</span>
              </div>
              <span className="text-[10px] font-semibold text-[#006a61]">Sincronizado vía RFID/SaaS</span>
            </div>
          </div>
        </div>

        {/* Auditing Panel / Product Details Drawer (1 side) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-0.5">Auditoría de Lote</h3>
            <p className="text-[11px] text-slate-400 mb-4">Información detallada del slot seleccionado</p>

            {selectedProduct ? (
              <div className="space-y-5">
                
                {/* Header status */}
                <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 space-y-1.5 relative overflow-hidden">
                  <div className="absolute right-3 top-3">
                    {selectedProduct.status === 'Disponible' && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">✔ DISPONIBLE</span>
                    )}
                    {selectedProduct.status === 'Bajo Stock' && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100">⚠️ ALERTA</span>
                    )}
                    {selectedProduct.status === 'Agotado' && (
                      <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-100">☢ AGOTADO</span>
                    )}
                  </div>

                  <span className="text-[10px] bg-slate-200/50 text-slate-600 px-1.5 py-0.5 rounded font-mono font-bold">{selectedProduct.sku}</span>
                  <h4 className="text-sm font-bold text-slate-900 pt-1 leading-snug">{selectedProduct.name}</h4>
                  <p className="text-[11px] text-slate-400">Categoría: <strong className="text-slate-600">{selectedProduct.category}</strong></p>
                </div>

                {/* Audit data specifications */}
                <div className="space-y-2.5 text-xs text-slate-700">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Ubicación Física:</span>
                    <span className="font-bold text-slate-800">{selectedProduct.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Cantidad de Stock (Actual):</span>
                    <span className="font-extrabold text-slate-950">{selectedProduct.quantity} Unidades</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium font-semibold">Límite Crítico Especial:</span>
                    <span className="font-bold text-rose-600">{selectedProduct.minStock} Unidades</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400 font-medium">Último Escaneo RFID:</span>
                    <span className="font-medium text-slate-500">{selectedProduct.lastUpdated}</span>
                  </div>
                </div>

                {/* Counter stock controller trigger (Interactive) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold tracking-widest text-[#7c839b] uppercase block">Ajuste Manual de Inventario</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAdjustStock(-10)}
                      disabled={selectedProduct.quantity <= 0}
                      className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xs font-bold rounded-lg text-slate-700 cursor-pointer"
                    >
                      Restar 10u.
                    </button>
                    <button
                      onClick={() => handleAdjustStock(10)}
                      className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold rounded-lg text-slate-700 cursor-pointer"
                    >
                      Sumar 10u.
                    </button>
                  </div>
                </div>

                {/* Secondary Delete Button */}
                <button
                  onClick={() => {
                    if (confirm('¿Estás seguro de que deseas eliminar este lote de estantería?')) {
                      onDeleteProduct(selectedProduct.id);
                      setSelectedProduct(null);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-rose-100 hover:border-rose-200"
                >
                  <Trash2 size={13} />
                  <span>Eliminar Lote permanentemente</span>
                </button>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <Grid size={32} className="text-[#006a61] opacity-70 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-[#0b1c30]">Auditar Estante</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px]">Selecciona cualquier slot del Mapa Virtual para ajustar cargas e inventarios.</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#006a61]/5 border border-[#006a61]/10 rounded-xl p-3.5 text-xs text-[#006a61] font-medium leading-relaxed mt-4 flex items-start gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong>Reabastecimiento Predictivo:</strong> La IA monitoriza permanentemente estos límites para generar propuestas de compra automáticas.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
