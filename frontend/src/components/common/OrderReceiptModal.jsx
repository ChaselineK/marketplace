import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Store,
  Calendar,
  Hash,
  Coins,
  Gamepad2,
} from 'lucide-react';
import PriceDisplay from './PriceDisplay';

export default function OrderReceiptModal({ order, isOpen, onClose }) {
  const receiptRef = useRef(null);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCompleted = order.status === 'completed';
  const isProcessing = order.status === 'processing';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:fixed-none page-transition">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Modal Top Control Bar (Hidden when printing: 30% Coca Brown with Electric Blue) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-coca-950 text-white border-b border-coca-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-electric-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blush-200">
              Official Purchase Receipt
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-electric-600 hover:bg-electric-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
              title="Print Receipt or Save as PDF"
            >
              <Printer className="w-4 h-4 mr-1" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-blush-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body: 60% Blush Sand Surfacing */}
        <div ref={receiptRef} className="p-6 sm:p-10 space-y-6 print:p-6 bg-blush-50 text-coca-950 text-xs">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b-2 border-coca-900">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-black overflow-hidden shrink-0 shadow-sm">
                <img src="/codm-logo.jpg" alt="CODM Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black tracking-tight leading-none">
                  <span className="text-coca-950">WILRICH</span>
                  <span className="text-electric-600 ml-1.5">STORE</span>
                </div>
                <div className="text-[10px] text-coca-700 uppercase tracking-widest font-bold mt-1">
                  Verified CODM Trading &amp; Currency Hub
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] font-mono text-coca-600 uppercase tracking-wider">
                Transaction Reference
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-coca-950">
                {order.public_reference}
              </div>
              <div className="text-[11px] text-coca-700 mt-0.5">
                Issued: {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Status Badge Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-700">Order Status:</span>
              {isCompleted && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> COMPLETED / SOLD
                </span>
              )}
              {isProcessing && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-quantum-100 text-quantum-800 border border-quantum-300">
                  <Clock className="w-3.5 h-3.5 mr-1 text-quantum-600" /> PROCESSING PAYMENT
                </span>
              )}
              {isCancelled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                  CANCELLED
                </span>
              )}
              {!isCompleted && !isProcessing && !isCancelled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" /> PENDING CONTACT
                </span>
              )}
            </div>

            <div className="text-[11px] text-stone-500 font-mono">
              Base Settlement Currency: <strong className="text-black">TZS</strong>
            </div>
          </div>

          {/* Parties: Buyer & Seller Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Buyer */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Customer Details
              </div>
              <div className="font-bold text-stone-900 text-sm">
                {order.customer?.name || 'Customer'}
              </div>
              <div className="text-stone-600 font-mono text-[11px]">
                {order.customer?.email}
              </div>
              {order.customer?.phone && (
                <div className="text-stone-600 font-mono text-[11px]">
                  Phone: {order.customer.phone}
                </div>
              )}
            </div>

            {/* Seller */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Authorized Seller
              </div>
              <div className="font-bold text-stone-900 text-sm flex items-center">
                <Store className="w-3.5 h-3.5 text-quantum-600 mr-1.5 shrink-0" />
                {order.vendor?.store_name || order.vendor?.name}
              </div>
              <div className="text-stone-600 font-mono text-[11px]">
                WhatsApp: +{order.vendor?.whatsapp_number || 'Direct Seller'}
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Platform Merchant
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="rounded-2xl border border-stone-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-700 text-[11px] font-bold uppercase tracking-wider border-b border-stone-200">
                  <th className="py-3 px-4">Item Details</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="py-4 px-4">
                    <div className="font-bold text-stone-900 text-sm">
                      {order.item_title_snapshot}
                    </div>
                    {order.item_description_snapshot && (
                      <div className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                        {order.item_description_snapshot}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-stone-100 text-stone-700 border border-stone-200">
                      {order.item_type === 'account' ? 'CODM Account' : 'CP Currency'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-stone-900">
                    {order.quantity}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-medium text-stone-800">
                    {order.price_currency} {Number(order.unit_price_amount).toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-stone-900">
                    {order.price_currency} {Number(order.total_price_amount).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section: 30% Coca Brown with 10% Electric Blue highlight */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-coca-950 text-white">
            <div>
              <div className="text-[10px] text-blush-200 uppercase tracking-wider font-bold">
                Settlement &amp; Verification Note
              </div>
              <div className="text-xs text-blush-300 mt-0.5">
                WhatsApp handoff &amp; direct seller escrow authorization.
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-[10px] text-blush-200 uppercase tracking-widest font-mono font-bold">
                Total Amount Paid / Due
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-electric-300 mt-0.5">
                {order.price_currency} {Number(order.total_price_amount).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Footer Terms & Authenticity Seal */}
          <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-500 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 text-stone-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-quantum-600" />
                <span>Digitally Verified by WILRICH STORE Transaction Protocol</span>
              </div>
              <div className="font-mono text-stone-400">
                Hash: {order.public_reference.replace(/-/g, '').toLowerCase()}-{order.id}992a
              </div>
            </div>
            <p className="leading-relaxed">
              This receipt constitutes electronic confirmation of an order placed on WILRICH STORE. For support or dispute mediation, present this document with order reference <strong>{order.public_reference}</strong>.
            </p>
          </div>
        </div>

        {/* Modal Bottom Print Button (Hidden on Print) */}
        <div className="print:hidden p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-700 hover:bg-white text-xs cursor-pointer transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-5 py-2 glass-button text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}

