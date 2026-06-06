import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  CheckCircle, 
  RefreshCw, 
  Cpu, 
  Route, 
  Sparkles, 
  Zap
} from 'lucide-react';
import { Shipment, Product } from '../types';

interface AIHubProps {
  shipments: Shipment[];
  products: Product[];
  onLogMessage: (type: 'shipment_update' | 'inventory_alert' | 'system_info', message: string) => void;
}

export default function AIHub({ shipments, products, onLogMessage }: AIHubProps) {
  const [selectedShipId, setSelectedShipId] = useState<string>('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationReport, setOptimizationReport] = useState<any | null>(null);

  // Chatbot states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ia'; text: string; time: string }>>([
    {
      sender: 'ia',
      text: 'Estimado operador. Soy el Asistente Logístico Integrado de SmartLogix. Puedo ayudarte a evaluar demoras en carretera, optimizar la disposición de mercancías dentro de los racks RFID, o predecir faltas de stock en base a tu inventario actual. ¿Qué requieres auditar hoy?',
      time: new Date().toLocaleTimeString().substring(0, 5)
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Optimiser logic trigger
  const handleRunOptimization = () => {
    if (!selectedShipId) return;
    setIsOptimizing(true);
    setOptimizationReport(null);

    const targetShip = shipments.find(s => s.id === selectedShipId);

    setTimeout(() => {
      setIsOptimizing(false);
      if (!targetShip) return;

      const fuelSavings = Math.floor(12 + Math.random() * 15);
      const timeSavings = Math.floor(4 + Math.random() * 8);
      const originalDistance = Math.floor(300 + Math.random() * 1200);
      const optimizedDistance = Math.round(originalDistance * (1 - (fuelSavings / 100)));

      setOptimizationReport({
        trackingNumber: targetShip.trackingNumber,
        origin: targetShip.origin,
        destination: targetShip.destination,
        carrier: targetShip.carrier,
        originalDistance: `${originalDistance} km`,
        optimizedDistance: `${optimizedDistance} km`,
        fuelSavings: `${fuelSavings}%`,
        timeSavings: `${timeSavings} horas`,
        alternativeNodes: ['Muelle Hub Regional B', 'Autopista Central Expresa 09', 'Aduana Fronteriza Integrada'],
        rationale: `El algoritmo de SmartLogix determinó que el transportista ${targetShip.carrier} puede evitar la congestión por mal clima o tráfico pesado desviando el camión por el nodo Hub Regional B. Esto reduce el consumo de combustible de forma sustentable y garantiza la entrega on-track.`
      });

      onLogMessage('system_info', `Optimización de Ruta IA ejecutada con éxito para envío ${targetShip.trackingNumber}. Ahorros estimados del ${fuelSavings}%.`);
    }, 1500);
  };

  // Chat message submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const timeNow = new Date().toLocaleTimeString().substring(0, 5);

    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setChatInput('');
    setIsTyping(true);

    // Simulate intelligent answers
    setTimeout(() => {
      setIsTyping(false);
      let replyText = '';

      const query = userText.toLowerCase();

      if (query.includes('stock') || query.includes('inventario') || query.includes('reabastecer') || query.includes('almacen')) {
        const lowStockItems = products.filter(p => p.status === 'Bajo Stock');
        if (lowStockItems.length > 0) {
          replyText = `Reporte de almacenamiento IA: Actualmente tienes ${lowStockItems.length} lotes con stock bajo criticidad (${lowStockItems.slice(0, 2).map(p => p.name).join(', ')}). Le sugiero emitir una orden de reabastecimiento en el módulo de "Almacenes Inteligentes" para rellenar al menos 50 unidades de cada uno antes del fin de semana.`;
        } else {
          replyText = "La auditoría de tus Racks RFID indica niveles saludables de almacenamiento. Todos los lotes están por encima del límite crítico de seguridad.";
        }
      } else if (query.includes('retraso') || query.includes('demoras') || query.includes('atrasado') || query.includes('shipping')) {
        const delayedList = shipments.filter(s => s.status === 'Retrasado');
        if (delayedList.length > 0) {
          replyText = `He detectado ${delayedList.length} envío(s) con estatus RETRASADO. El envío ${delayedList[0].trackingNumber} hacia ${delayedList[0].destination} presenta desvíos climatológicos. Te sugiero correr el 'Optimizador de Ruta IA' en el panel izquierdo de este mismo módulo para recalcular un desvío intermedio.`;
        } else {
          replyText = "Felicidades, todas tus rutas activas muestran estatus 'En Tránsito' o 'Entregado'. No se reportan anomalías de carreteras en las matrices satelitales.";
        }
      } else if (query.includes('hola') || query.includes('buenas') || query.includes('buenos') || query.includes('ayuda')) {
        replyText = "¡Hola! Estoy listo para apoyarte en el control logístico. Puedes consultarme cosas como: '¿Qué productos tienen bajo stock?', '¿Tengo rutas con demoras?' o pedirme consejos sobre optimización sustentable de transporte.";
      } else {
        replyText = `Entendido. He analizado tu consulta sobre "${userText}". Sincronizando con la base de datos de SmartLogix... Te sugiero mantener vigilado el transportista prioritario. Mi sugerencia general es automatizar la recepción RFID de bultos pesados para evitar cuellos de botella en la terminal general.`;
      }

      setChatMessages(prev => [...prev, { sender: 'ia', text: replyText, time: new Date().toLocaleTimeString().substring(0, 5) }]);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#006a61]">SOCIO DE OPTIMIZACIÓN INTELIGENTE</span>
          <h2 className="text-xl font-extrabold text-[#0b1c30] mt-0.5">Asistente Copiloto IA Logístico</h2>
          <p className="text-slate-500 text-xs mt-0.5 font-normal">Sincroniza algoritmos satelitales y genera rutas eficientes, reduciendo huella de carbono y previniendo quiebres de inventarios.</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131b2e] text-[#89f5e7] border border-slate-800 rounded-lg text-xs font-mono font-semibold">
          <Cpu size={14} />
          <span>Integración SmartCloud</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Run routing simulation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between min-h-[460px]">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Route className="text-[#006a61]" size={16} />
                Optimizador Matemático de Ruta Satelital
              </h3>
              <p className="text-[11px] text-slate-400">Selecciona un envío activo para recalcular y evitar peajes retrasados o inclemencias climáticas</p>
            </div>

            {/* Shipment picker */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block">SELECCIONAR ENVÍO ACTIVO</label>
              <select
                value={selectedShipId}
                onChange={(e) => {
                  setSelectedShipId(e.target.value);
                  setOptimizationReport(null);
                }}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#006a61]/10 focus:border-[#006a61] outline-none"
              >
                <option value="">-- Elige un envío de la lista --</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trackingNumber} : {s.origin} ➔ {s.destination} ({s.carrier} - {s.status})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRunOptimization}
              disabled={!selectedShipId || isOptimizing}
              className="w-full py-2.5 px-4 bg-slate-900 border border-slate-800 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="animate-spin text-[#89f5e7]" size={14} />
                  <span>Calculando nodos óptimos satelitales...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#0d9488]" />
                  <span>Optimizar Ruta de Transporte</span>
                </>
              )}
            </button>

            {/* Simulated report render board */}
            {optimizationReport && (
              <div className="mt-4 p-4 bg-[#131b2e] rounded-xl text-white space-y-3 border border-slate-800 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-semibold text-[#89f5e7] uppercase tracking-wider">REPORTE GENERADO CON ÉXITO</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-400">{optimizationReport.trackingNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-300">
                  <div>
                    <p className="text-[9px] text-[#7c839b] font-bold uppercase">AHORRO DISTANCIA</p>
                    <p className="font-bold text-white text-sm line-through text-slate-400">{optimizationReport.originalDistance}</p>
                    <p className="font-bold text-[#89f5e7] text-md">{optimizationReport.optimizedDistance}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#7c839b] font-bold uppercase">AHORRO COMBUSTIBLE CO2</p>
                    <p className="font-extrabold text-[#89f5e7] text-lg flex items-center gap-1">
                      <Zap size={13} className="text-emerald-400" />
                      <span>{optimizationReport.fuelSavings}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <p className="text-[9px] text-[#7c839b] font-bold uppercase">DESVÍO DE NODOS RECOMENDADO</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {optimizationReport.alternativeNodes.map((node: string, index: number) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-800 text-[10px] rounded text-slate-200 border border-slate-700/50">
                        {node}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-medium bg-slate-950/40 p-2.5 rounded-lg border border-slate-900/50">
                  {optimizationReport.rationale}
                </p>
              </div>
            )}
          </div>

          <div className="bg-[#006a61]/5 border border-[#006a61]/10 rounded-xl p-3 text-[11px] text-[#006a61] font-semibold flex items-center gap-2 mt-4">
            <CheckCircle size={14} className="text-[#006a61]" />
            <span>Este módulo simula telemetría GPS real integrada de SmartLogix para camiones.</span>
          </div>
        </div>

        {/* Dynamic Generative Chatbot (Col span 1) */}
        <div className="bg-[#131b2e] p-5 rounded-xl border border-slate-800 shadow-xl flex flex-col justify-between text-white min-h-[460px]">
          
          {/* Box Header chatbot */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-white text-slate-900 flex items-center justify-center">
                <Bot size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Logix-AI Scout</h4>
                <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Operador en Línea</span>
                </p>
              </div>
            </div>
            
            <span className="text-[10px] font-bold text-[#7c839b] uppercase font-mono">SaaS Assistant</span>
          </div>

          {/* Conversation history area */}
          <div className="flex-1 my-4 pr-1 overflow-y-auto space-y-3.5 max-h-[280px]">
            {chatMessages.map((msg, index) => {
              const isIA = msg.sender === 'ia';
              return (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${isIA ? 'self-start mr-auto' : 'self-end ml-auto items-end'}`}
                >
                  <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                    isIA 
                      ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none' 
                      : 'bg-[#006a61] text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-semibold italic">{msg.time}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-2.5 bg-slate-800 border border-slate-700 rounded-xl rounded-tl-none text-xs text-slate-300 w-fit">
                <RefreshCw className="animate-spin" size={12} />
                <span>Logix-AI Scout está formulando respuesta...</span>
              </div>
            )}
          </div>

          {/* Chat input box trigger */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text"
              placeholder="Pregúntale a la IA algo como: 'Tengo stock bajo?'"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-900 text-xs px-3.5 py-3 rounded-lg outline-none border border-slate-800 focus:border-[#006a61] text-white font-medium"
            />
            <button
              type="submit"
              className="bg-[#006a61] hover:bg-[#005049] text-white px-3 py-3 rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-95"
              title="Preguntar"
            >
              <Send size={15} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
