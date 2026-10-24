import React, { useState, useEffect } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function OrderSuccessModal({
  order,
  onClose,
  whatsappNumber = '917507792060'
}) {
  if (!order) return null;

  const [copiedId, setCopiedId] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);

  // Construct comprehensive prefilled message
  const itemsText = order.items
    .map((i) => {
      const unitLabel = i.unit === 'kg' ? 'kg' : (i.weight || 'pack');
      return `• ${i.name} (${unitLabel}) × ${i.quantity} = ₹${i.total}`;
    })
    .join('\n');

  const messageText = [
    `*NEW ORDER — CRAZY CRUNCH*`,
    `*Order Ref:* ${order.orderRef}`,
    `*Customer:* ${order.customer.name}`,
    `*Phone:* ${order.customer.phone}`,
    `*Delivery Address:* ${order.customer.address}`,
    order.customer.area ? `*Area:* ${order.customer.area}` : '',
    order.customer.city ? `*City:* ${order.customer.city}` : '',
    order.customer.pincode ? `*PIN:* ${order.customer.pincode}` : '',
    order.customer.notes ? `*Instructions:* ${order.customer.notes}` : '',
    '',
    '*Items Ordered:*',
    itemsText,
    '',
    `*Subtotal:* ₹${order.subtotal}`,
    `*Delivery Charge:* ₹0 (Free Delivery in Kolhapur)`,
    `*Final Total:* ₹${order.grandTotal}`,
    `*Payment Method:* Cash on Delivery (COD)`
  ].filter(Boolean).join('\n');

  const cleanPhone = (whatsappNumber || '917507792060').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  // Auto-attempt opening WhatsApp once upon modal appearance
  useEffect(() => {
    try {
      const win = window.open(whatsappUrl, '_blank');
      if (win) {
        setWhatsappOpened(true);
      }
    } catch (e) {
      console.warn('Auto-opening WhatsApp popup blocked by browser', e);
    }
  }, [order.id]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderRef);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-8 border border-[#c5a059]/30 text-center animate-fade-in">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-[#e8f5e9] text-[#1b4332] rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-sm border border-[#c8e6c9]">
          <CheckCircle2 className="w-10 h-10 text-[#1b4332]" />
        </div>

        <h3 className="text-2xl font-black text-[#0f382c] tracking-tight brand-font">Order Saved & Confirmed!</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Thank you, <strong className="text-[#0f382c]">{order.customer.name}</strong>! Your order is safely recorded in our database.
        </p>

        {/* Order Reference Badge */}
        <div className="bg-[#fdfbf7] border border-[#c5a059]/40 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-[#1b4332] tracking-wider block">
              Unique Order Reference
            </span>
            <span className="text-base font-black text-[#0f382c] font-mono">
              {order.orderRef}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            className="p-2 bg-white text-[#0f382c] hover:bg-[#f4ede2] rounded-xl border border-[#c5a059]/40 transition-colors shadow-xs"
            title="Copy reference code"
          >
            {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Important WhatsApp Guidance Notice */}
        <div className="bg-[#f0fdf4] border border-[#86efac] rounded-2xl p-3 text-xs text-[#14532d] text-left mb-4 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
            <MessageCircle className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Send Order via WhatsApp:</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            WhatsApp should open with your order prefilled. <strong>Please tap Send in WhatsApp</strong> to directly notify Crazy Crunch (+91 7507792060).
          </p>
        </div>

        {/* Items Summary Breakdown */}
        <div className="bg-[#fdfbf7] rounded-2xl p-3.5 text-left border border-[#c5a059]/20 text-xs space-y-2 mb-4">
          <div className="font-bold text-[#0f382c] border-b border-[#c5a059]/20 pb-1.5 flex justify-between">
            <span>Items Ordered ({order.items.length})</span>
            <span>Final Total: ₹{order.grandTotal}</span>
          </div>
          <div className="space-y-1 max-h-28 overflow-y-auto">
            {order.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-slate-600">
                <span className="truncate pr-2">
                  {i.name} ({i.unit === 'kg' ? 'kg' : (i.weight || 'pack')}) × {i.quantity}
                </span>
                <span className="font-bold text-[#0f382c] shrink-0">₹{i.total}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#c5a059]/20 pt-1.5 flex justify-between font-bold text-xs text-[#0f382c]">
            <span>Payment Method:</span>
            <span className="text-emerald-700">Cash on Delivery</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Main WhatsApp Click-to-Chat Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 transition-all text-xs sm:text-sm active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{whatsappOpened ? 'Open WhatsApp Again' : 'Send Order to WhatsApp (+91 7507792060)'}</span>
          </a>

          {/* Fallback Copy Message Button */}
          <button
            type="button"
            onClick={handleCopyMessage}
            className="w-full py-2.5 px-4 bg-[#fdfbf7] hover:bg-[#f4ede2] text-[#0f382c] border border-[#c5a059]/40 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            {copiedMsg ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Order Message Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Order Message to Paste Manually</span>
              </>
            )}
          </button>

          {/* Close / Return Home */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors"
          >
            Continue Browsing Snacks
          </button>
        </div>
      </div>
    </div>
  );
}
