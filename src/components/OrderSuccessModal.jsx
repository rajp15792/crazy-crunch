import React from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, Package, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function OrderSuccessModal({ order, onClose, whatsappNumber = '919876543210' }) {
  if (!order) return null;

  const [copied, setCopied] = useState(false);

  const copyRef = () => {
    navigator.clipboard.writeText(order.orderRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // WhatsApp prefilled message
  const itemsText = order.items.map((i) => `• ${i.name} (${i.weight}) x${i.quantity} = ₹${i.total}`).join('\n');
  const messageText = `*New Order Placed - Crazy Crunch*\n*Order Ref:* ${order.orderRef}\n*Customer:* ${order.customer.name}\n*Phone:* ${order.customer.phone}\n*Address:* ${order.customer.address}\n\n*Items Ordered:*\n${itemsText}\n\n*Total Amount:* ₹${order.grandTotal} (${order.paymentMethod})\n*Status:* ${order.status}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative my-8 border border-orange-100 text-center animate-fade-in">
        
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-100">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>

        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Confirmed!</h3>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Thank you, <strong className="text-slate-800">{order.customer.name}</strong>! Your freshly packed snacks are being prepared.
        </p>

        {/* Order Reference Badge */}
        <div className="bg-orange-50 border border-orange-200/80 rounded-2xl p-3.5 mb-5 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-orange-800 tracking-wider block">
              Order Reference Number
            </span>
            <span className="text-base font-black text-orange-950 font-mono">
              {order.orderRef}
            </span>
          </div>
          <button
            onClick={copyRef}
            className="p-2 bg-white text-orange-700 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors"
            title="Copy reference code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 text-xs space-y-2 mb-5">
          <div className="font-bold text-slate-700 border-b border-slate-200/70 pb-1.5 flex justify-between">
            <span>Items Ordered</span>
            <span>₹{order.grandTotal}</span>
          </div>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {order.items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-slate-600">
                <span className="truncate pr-2">{i.name} ({i.weight}) × {i.quantity}</span>
                <span className="font-semibold text-slate-800 shrink-0">₹{i.total}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200/70 pt-2 flex justify-between font-bold text-slate-900">
            <span>Payment Method</span>
            <span className="text-orange-600">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all text-xs sm:text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Send Order Details to WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-colors"
          >
            Back to Home & Snacks
          </button>
        </div>
      </div>
    </div>
  );
}
