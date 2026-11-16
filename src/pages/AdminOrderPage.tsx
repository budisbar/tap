import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ShieldAlert, ArrowLeft, Clock, CreditCard, Building, Mail, Phone, Hash, Layers } from 'lucide-react';
import { dataService, OrderRequest, User } from '../lib/dataService';

export default function AdminOrderPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [order, setOrder] = useState<OrderRequest | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set noindex on page
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let created = false;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.name = 'robots';
      document.head.appendChild(metaTag);
      created = true;
    }
    const previousContent = metaTag.content;
    metaTag.content = 'noindex, nofollow';

    return () => {
      if (created && metaTag) {
        document.head.removeChild(metaTag);
      } else if (metaTag) {
        metaTag.content = previousContent;
      }
    };
  }, []);

  // Listen for user auth
  useEffect(() => {
    const unsub = dataService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  const isAuthorized = Boolean(
    user &&
    user.email?.toLowerCase() === 'tapncon.info@gmail.com' &&
    user.emailVerified === true
  );

  // Fetch order once authorized
  useEffect(() => {
    if (!authChecked) return;
    if (!isAuthorized || !orderId) {
      setIsLoadingOrder(false);
      return;
    }

    setIsLoadingOrder(true);
    dataService.getOrderById(orderId)
      .then((data) => {
        if (!data) {
          setError('Order not found in database.');
        } else {
          setOrder(data);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load order.');
      })
      .finally(() => {
        setIsLoadingOrder(false);
      });
  }, [authChecked, isAuthorized, orderId]);

  const handleDownloadPng = (dataUrl: string, filename: string) => {
    if (!dataUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1050;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = filename;
        link.click();
      }
    };
    img.src = dataUrl;
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Not authorized</h1>
          <p className="text-gray-400 text-sm mb-6">
            Only the verified administrator account (<code>tapncon.info@gmail.com</code>) can open this order.
          </p>
          {user && !user.emailVerified && user.email?.toLowerCase() === 'tapncon.info@gmail.com' && (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-300 text-xs text-left">
              Your account email is not verified yet. Please check your inbox and click the verification link to proceed.
            </div>
          )}
          <Link
            to="/"
            className="inline-flex items-center text-sm font-semibold px-5 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center text-xs uppercase tracking-widest text-gray-400 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-gray-400 text-sm mt-1">
              Order ID: <span className="font-mono text-white">{orderId}</span>
            </p>
          </div>
          {order && (
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-xs font-semibold uppercase tracking-wider">
                {order.status || 'Pending'}
              </span>
              <div className="text-xs text-gray-500 mt-2 flex items-center justify-end">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {isLoadingOrder ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : error || !order ? (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center text-gray-400">
            <p className="text-lg text-white mb-2">{error || 'Order not found'}</p>
            <p className="text-sm">Verify the order ID or check your Firestore database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer & Spec Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-4 pb-3 border-b border-white/10">
                  Customer Information
                </h2>
                <div className="space-y-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Contact Name</div>
                    <div className="font-medium text-white text-base mt-0.5">{order.name}</div>
                  </div>

                  {order.businessName && (
                    <div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Building className="w-3.5 h-3.5 mr-1" /> Business Name
                      </div>
                      <div className="font-medium text-white mt-0.5">{order.businessName}</div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1" /> Email
                    </div>
                    <a
                      href={`mailto:${order.email}`}
                      className="text-white hover:underline mt-0.5 block break-all font-mono text-xs"
                    >
                      {order.email}
                    </a>
                  </div>

                  {order.phone && (
                    <div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-1" /> Phone
                      </div>
                      <a href={`tel:${order.phone}`} className="text-white hover:underline mt-0.5 block">
                        {order.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <h2 className="text-xs uppercase tracking-widest font-semibold text-gray-400 mb-4 pb-3 border-b border-white/10">
                  Order Specifications
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center">
                      <Hash className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> Quantity
                    </span>
                    <span className="font-bold text-white text-lg">{order.quantity}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1.5 text-gray-500" /> Material
                    </span>
                    <span className="font-semibold text-white">{order.material}</span>
                  </div>

                  {order.notes && (
                    <div className="pt-3 border-t border-white/10">
                      <div className="text-xs text-gray-500 mb-1">Customer Notes</div>
                      <div className="p-3 bg-white/5 rounded-lg text-gray-300 text-xs whitespace-pre-wrap leading-relaxed">
                        {order.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Previews & PNG Downloads */}
            <div className="lg:col-span-2 space-y-6">
              {/* Front Preview */}
              <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                    Front Design Preview
                  </h2>
                  {order.previewFront && (
                    <button
                      type="button"
                      onClick={() => handleDownloadPng(order.previewFront!, `order-${order.id}-front.png`)}
                      className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Front PNG</span>
                    </button>
                  )}
                </div>

                <div className="aspect-[1.58] bg-[#050505] rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                  {order.previewFront ? (
                    <img
                      src={order.previewFront}
                      alt="Front card preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                    />
                  ) : (
                    <span className="text-gray-600 text-sm">No front preview attached</span>
                  )}
                </div>
              </div>

              {/* Back Preview */}
              {order.previewBack && (
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                      Back Design Preview
                    </h2>
                    <button
                      type="button"
                      onClick={() => handleDownloadPng(order.previewBack!, `order-${order.id}-back.png`)}
                      className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Back PNG</span>
                    </button>
                  </div>

                  <div className="aspect-[1.58] bg-[#050505] rounded-xl border border-white/10 p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src={order.previewBack}
                      alt="Back card preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
