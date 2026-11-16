import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, X } from 'lucide-react';
import CardPreview from './CardPreview';
import { CardMaterial, CardState, ElementData, Orientation, Side } from './customizerData';
import { dataService } from '../../lib/dataService';

interface OrderCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: Record<Side, CardState>;
  orientation: Orientation;
  productType: 'card' | 'board';
  selectedMaterial: CardMaterial | null;
  defaultName?: string;
  defaultEmail?: string;
}

const WEB3FORMS_KEY = '76c3e805-f22f-4983-ac74-ece131e29225';

function sanitizeCardData(cardData: Record<Side, CardState>): Record<Side, CardState> {
  const cleanSide = (side: CardState): CardState => ({
    ...side,
    elements: side.elements.map((el) =>
      el.imageUrl && el.imageUrl.length > 500
        ? { ...el, imageUrl: '[Uploaded image omitted from text payload]' }
        : el
    ),
  });

  return {
    front: cleanSide(cardData.front),
    back: cleanSide(cardData.back),
  };
}

export default function OrderCardModal({
  isOpen,
  onClose,
  cardData,
  orientation,
  productType,
  selectedMaterial,
  defaultName = '',
  defaultEmail = '',
}: OrderCardModalProps) {
  const [quantity, setQuantity] = useState('10');
  const [name, setName] = useState(defaultName);
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setSubmitStatus('idle');
    setErrorMessage('');
    if (defaultName && !name) setName(defaultName);
    if (defaultEmail && !email) setEmail(defaultEmail);
  }, [isOpen, defaultName, defaultEmail]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting) return;

    // Honeypot spam check
    if (honeypot.trim()) {
      setSubmitStatus('success');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const sanitizedDesign = sanitizeCardData(cardData);

      // 1. Capture compressed previews (< 100 KB each)
      let frontPreview = '';
      let backPreview = '';

      try {
        const { toJpeg } = await import('html-to-image');
        const frontEl = document.getElementById('capture-front');
        const backEl = document.getElementById('capture-back');

        if (frontEl) {
          frontPreview = await toJpeg(frontEl, { quality: 0.7, pixelRatio: 1, cacheBust: true });
        }
        if (backEl && productType !== 'board') {
          backPreview = await toJpeg(backEl, { quality: 0.7, pixelRatio: 1, cacheBust: true });
        }
      } catch {
        // Fall back gracefully if canvas capture fails
      }

      // Generate order ID
      const orderId = crypto.randomUUID().slice(0, 12);
      const orderDate = new Date();
      const materialName = selectedMaterial?.name || 'Plastic';

      // 2. First save the order to Firestore at orders/{orderId}
      await dataService.createOrder({
        id: orderId,
        name: name.trim(),
        businessName: businessName.trim() || undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        notes: notes.trim() || undefined,
        material: materialName,
        designData: sanitizedDesign,
        previewFront: frontPreview,
        previewBack: backPreview,
      });

      // 3. Send email through Web3Forms to tapncon.info@gmail.com
      const displaySubject = `New order request: ${businessName.trim() || name.trim()}, ${quantity} cards`;
      const emailBody = [
        'New Order Request Received',
        '========================================',
        `Order ID: ${orderId}`,
        `Date: ${orderDate.toLocaleString()}`,
        '',
        'CUSTOMER DETAILS',
        `Name: ${name.trim()}`,
        `Business Name: ${businessName.trim() || 'N/A'}`,
        `Email: ${email.trim()}`,
        `Phone: ${phone.trim() || 'N/A'}`,
        `Quantity: ${quantity}`,
        `Material: ${materialName}`,
        '',
        'CUSTOMER NOTES',
        notes.trim() || 'None',
        '',
        'ADMIN ORDER & DOWNLOAD LINK',
        `https://tapncon.online/admin/orders/${orderId}`,
      ].join('\n');

      const web3Response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: displaySubject,
          from_name: 'Tap & Con Website',
          name: name.trim(),
          email: email.trim(),
          reply_to: email.trim(),
          message: emailBody,
        }),
      });

      const result = await web3Response.json();

      if (web3Response.ok && result.success) {
        setSubmitStatus('success');
      } else {
        // If web3forms had an issue, keep what user typed and show error
        setSubmitStatus('error');
        setErrorMessage(result.message || 'There was an error sending your order request. Please try again.');
      }
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMessage(err?.message || 'There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewWidth = productType === 'board' ? 120 : orientation === 'horizontal' ? 180 : 115;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-card-title"
    >
      <div
        className="bg-[#0a0a0a] border border-white/15 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 id="order-card-title" className="text-lg font-serif text-white">
            Order this card
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close order panel"
            className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="py-8 text-center space-y-5">
              <CheckCircle className="w-10 h-10 text-white mx-auto" aria-hidden="true" />
              <p className="text-lg text-white font-medium">
                Thank you. We will contact you by email within 24 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Back to Studio
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden Honeypot Field */}
              <input
                type="text"
                name="_honeypot"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Front & Back Design Preview */}
              <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                      Front
                    </span>
                    <CardPreview
                      sideState={cardData.front}
                      orientation={orientation}
                      productType={productType}
                      material={selectedMaterial}
                      width={previewWidth}
                    />
                  </div>
                  {productType !== 'board' && (
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        Back
                      </span>
                      <CardPreview
                        sideState={cardData.back}
                        orientation={orientation}
                        productType={productType}
                        material={selectedMaterial}
                        width={previewWidth}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="order-quantity"
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400"
                  >
                    Quantity <span className="text-white">*</span>
                  </label>
                  <input
                    id="order-quantity"
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="order-name"
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400"
                  >
                    Name <span className="text-white">*</span>
                  </label>
                  <input
                    id="order-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
              </div>

              {/* Business Name (Optional) */}
              <div>
                <label
                  htmlFor="order-business"
                  className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400"
                >
                  Business Name <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <input
                  id="order-business"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Company"
                  className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="order-email"
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400"
                  >
                    Email <span className="text-white">*</span>
                  </label>
                  <input
                    id="order-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="order-phone"
                    className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400"
                  >
                    Phone <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="order-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                    className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors"
                  />
                </div>
              </div>

              {/* Notes (Optional) */}
              <div>
                <label
                  htmlFor="order-notes"
                  className="block text-[10px] uppercase tracking-widest font-bold mb-1.5 text-gray-400"
                >
                  Notes <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  id="order-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any custom requests, special finishes, or instructions..."
                  className="w-full bg-[#111] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/50 transition-colors resize-none"
                />
              </div>

              {submitStatus === 'error' && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {errorMessage || 'There was an error sending your order request. Please try again.'}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-white text-black py-3.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-200'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                    Sending...
                  </>
                ) : (
                  'Send order request'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
