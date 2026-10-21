import React, { useState } from 'react';
import { X, CreditCard, Truck, CheckCircle, Package } from 'lucide-react';
import { db, ShippingAddress, Order } from '../lib/mockDb';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string | null;
  projectName: string;
  user: any;
}

const PRICE_PER_CARD = 25.00;

export default function CheckoutModal({ isOpen, onClose, projectId, projectName, user }: CheckoutModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  if (!isOpen || !user) return null;

  const totalAmount = quantity * PRICE_PER_CARD;

  const handleNext = () => setStep(prev => (prev + 1) as any);
  const handleBack = () => setStep(prev => (prev - 1) as any);

  const handleCheckout = async () => {
    if (!projectId) return;
    setIsProcessing(true);
    try {
      await db.createOrder(user.id, projectId, quantity, totalAmount, address);
      setStep(4); // Success step
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to process order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    onClose();
    navigate('/portal');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#151515]">
          <h2 className="text-xl font-serif text-white">Complete Your Order</h2>
          {step !== 4 && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {step !== 4 && (
          <div className="flex items-center justify-between px-12 py-6 border-b border-white/5 bg-[#0a0a0a]">
            <div className={`flex flex-col items-center ${step >= 1 ? 'text-white' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold ${step >= 1 ? 'bg-white text-black' : 'bg-[#222]'}`}>1</div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Details</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${step >= 2 ? 'bg-white' : 'bg-[#222]'}`} />
            <div className={`flex flex-col items-center ${step >= 2 ? 'text-white' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold ${step >= 2 ? 'bg-white text-black' : 'bg-[#222]'}`}>2</div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Shipping</span>
            </div>
            <div className={`flex-1 h-px mx-4 ${step >= 3 ? 'bg-white' : 'bg-[#222]'}`} />
            <div className={`flex flex-col items-center ${step >= 3 ? 'text-white' : 'text-gray-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 font-bold ${step >= 3 ? 'bg-white text-black' : 'bg-[#222]'}`}>3</div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Payment</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 flex items-center space-x-6">
                <div className="w-20 h-20 bg-[#222] rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Design: {projectName}</h3>
                  <p className="text-sm text-gray-400">Premium NFC Smart Card</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-4 uppercase tracking-widest">Select Quantity</label>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-xl bg-[#222] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors text-xl font-bold">-</button>
                  <span className="text-2xl font-serif text-white w-12 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-xl bg-[#222] border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors text-xl font-bold">+</button>
                </div>
              </div>

              <div className="bg-black p-6 rounded-xl border border-white/5 space-y-4">
                <div className="flex justify-between text-gray-400">
                  <span>Price per card</span>
                  <span>${PRICE_PER_CARD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-white font-bold text-xl pt-4 border-t border-white/10">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input type="text" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Country</label>
                  <select value={address.country} onChange={e => setAddress({...address, country: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors appearance-none">
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Europe</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Street Address</label>
                  <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="123 Main St, Apt 4B" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">City</label>
                  <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">State / Province</label>
                  <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="NY" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Zip Code</label>
                  <input type="text" value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="10001" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#00d2ff]/20 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-[#00d2ff]/10 rounded-full flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-[#00d2ff]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Simulated Checkout</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto">This is a prototype. No real payment will be processed. Clicking "Place Order" will successfully mock a transaction and save your order.</p>
                </div>
              </div>
              
              {/* Fake card input to look complete */}
              <div className="space-y-4 opacity-50 pointer-events-none">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Card Number</label>
                  <input type="text" value="•••• •••• •••• 4242" readOnly className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expiry</label>
                    <input type="text" value="12/26" readOnly className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">CVC</label>
                    <input type="text" value="•••" readOnly className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in zoom-in-95">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-3xl font-serif text-white mb-3">Order Confirmed!</h3>
                <p className="text-gray-400 max-w-sm mx-auto">Your card is being processed and will be shipped soon. You can track your order in the Client Portal.</p>
              </div>
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 w-full max-w-sm">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-white font-mono">#{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Paid:</span>
                  <span className="text-white font-bold">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {step !== 4 ? (
          <div className="p-6 border-t border-white/10 bg-[#151515] flex justify-between items-center">
            {step > 1 ? (
              <button onClick={handleBack} className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">
                Back
              </button>
            ) : <div></div>}
            
            {step < 3 ? (
              <button 
                onClick={handleNext} 
                disabled={step === 2 && (!address.fullName || !address.street || !address.city)}
                className="px-8 py-3 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleCheckout} 
                disabled={isProcessing}
                className="px-8 py-3 bg-[#00d2ff] text-black text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-[#00b8e6] transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <span>Place Order - ${totalAmount.toFixed(2)}</span>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="p-6 border-t border-white/10 bg-[#151515] flex justify-center">
            <button 
              onClick={handleFinish}
              className="px-8 py-3 bg-white text-black text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-all w-full max-w-sm"
            >
              Go to Portal
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
