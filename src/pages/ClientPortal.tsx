import React, { useState, useEffect, MouseEvent } from 'react';
import { dataService, User, SavedDesign, ImageAsset } from '../lib/dataService';
import { Plus, Image as ImageIcon, Layout, Clock, Trash2, X, CreditCard, Edit2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BoardIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 20h14" />
    <path d="M19 20l1.5-3" />
    <path d="M5.5 20l1.5-16h11l-1.5 16" />
  </svg>
);

interface ClientPortalProps {
  user: User;
  onOpenProject: (projectId: string) => void;
  onNewProject: (type: 'card' | 'board') => void;
}

export default function ClientPortal({ user, onOpenProject, onNewProject }: ClientPortalProps) {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'designs' | 'images'>('designs');
  const [isLoading, setIsLoading] = useState(true);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<SavedDesign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Rename modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [designToRename, setDesignToRename] = useState<SavedDesign | null>(null);
  const [newDesignName, setNewDesignName] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Product Type Modal state
  const [productTypeModalOpen, setProductTypeModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userDesigns, userImages] = await Promise.all([
        dataService.getDesignsByUser(user.id),
        dataService.getImagesByUser(user.id)
      ]);
      setDesigns(userDesigns);
      setImages(userImages);
    } catch (err) {
      console.error('Failed to load user designs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleDeleteClick = (e: MouseEvent, design: SavedDesign) => {
    e.stopPropagation();
    setDesignToDelete(design);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!designToDelete) return;
    setIsDeleting(true);
    try {
      await dataService.deleteDesign(user.id, designToDelete.id);
      setDeleteModalOpen(false);
      setDesignToDelete(null);
      await fetchData();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete design. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRenameClick = (e: MouseEvent, design: SavedDesign) => {
    e.stopPropagation();
    setDesignToRename(design);
    setNewDesignName(design.name);
    setRenameModalOpen(true);
  };

  const confirmRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designToRename || !newDesignName.trim()) return;
    setIsRenaming(true);
    try {
      await dataService.renameDesign(user.id, designToRename.id, newDesignName.trim());
      setRenameModalOpen(false);
      setDesignToRename(null);
      await fetchData();
    } catch (err) {
      console.error('Rename failed:', err);
      alert('Failed to rename design.');
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to your tap&con workspace</h1>
            <p className="text-gray-400 text-sm">Manage your custom NFC designs and brand assets.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setProductTypeModalOpen(true)}
              className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Design</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('designs')}
            className={`pb-4 text-sm font-medium tracking-wide uppercase transition-colors relative ${activeTab === 'designs' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            My Designs ({designs.length})
            {activeTab === 'designs' && (
              <motion.div layoutId="portalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-4 text-sm font-medium tracking-wide uppercase transition-colors relative ${activeTab === 'images' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Image Library
            {activeTab === 'images' && (
              <motion.div layoutId="portalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
            )}
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {activeTab === 'designs' ? (
              designs.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-[#0a0a0a]">
                  <Layout className="w-12 h-12 text-gray-600 mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-xl font-semibold mb-2">No designs yet</h2>
                  <p className="text-gray-400 mb-6">Head over to the Design Studio to create your first card.</p>
                  <button
                    type="button"
                    onClick={() => setProductTypeModalOpen(true)}
                    className="text-white underline hover:text-gray-300 font-semibold"
                  >
                    Open Design Studio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {designs.map((design) => {
                    const preview = design.previewFront;
                    return (
                      <div
                        key={design.id}
                        className="group bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Thumbnail */}
                          <div
                            onClick={() => onOpenProject(design.id)}
                            className="aspect-[1.58] bg-[#111] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-[#161616] transition-colors cursor-pointer border border-white/5"
                          >
                            {preview ? (
                              <img
                                src={preview}
                                alt={`${design.name} NFC design preview`}
                                width={300}
                                height={190}
                                loading="lazy"
                                className="w-full h-full object-contain p-2 opacity-90 group-hover:opacity-100 transition-opacity"
                              />
                            ) : (
                              <Layout className="w-8 h-8 text-gray-700" aria-hidden="true" />
                            )}
                          </div>

                          {/* Info */}
                          <h2 className="font-semibold text-lg text-white mb-1 truncate">{design.name}</h2>
                          <div className="flex items-center text-xs text-gray-500 space-x-1.5 mb-5">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Last edited {new Date(design.updatedAt).toLocaleDateString()}</span>
                            <span className="text-gray-600">•</span>
                            <span className="capitalize">{design.material || 'Plastic'}</span>
                          </div>
                        </div>

                        {/* Action buttons: Open, Rename, Delete */}
                        <div className="flex items-center space-x-2 pt-3 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => onOpenProject(design.id)}
                            className="flex-1 px-3 py-2 bg-white text-black font-semibold text-xs rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Open</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleRenameClick(e, design)}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1 border border-white/10"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteClick(e, design)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                            title="Delete Design"
                            aria-label={`Delete ${design.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              images.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-[#0a0a0a]">
                  <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" aria-hidden="true" />
                  <h2 className="text-xl font-semibold mb-2">Image library is empty</h2>
                  <p className="text-gray-400">Logos and images uploaded in the Design Studio will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="aspect-square bg-[#111] border border-white/10 rounded-xl overflow-hidden relative group">
                      <img src={img.url} alt="Uploaded design asset" width={160} height={160} loading="lazy" className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-white bg-black/80 px-2 py-1 rounded">Uploaded</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && designToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-2">Delete Design</h2>
              <p className="text-gray-400 mb-6 text-sm">
                Are you sure you want to delete <strong className="text-white">"{designToDelete.name}"</strong>? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Modal */}
      <AnimatePresence>
        {renameModalOpen && designToRename && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setRenameModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl font-bold mb-2">Rename Design</h2>
              <p className="text-gray-400 mb-4 text-sm">
                Enter a new name for your design.
              </p>

              <form onSubmit={confirmRename} className="space-y-4">
                <input
                  type="text"
                  value={newDesignName}
                  onChange={(e) => setNewDesignName(e.target.value)}
                  placeholder="Design name"
                  autoFocus
                  required
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white transition-colors text-sm"
                />

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setRenameModalOpen(false)}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRenaming || !newDesignName.trim()}
                    className="flex-1 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isRenaming ? 'Saving...' : 'Save Name'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Type Selection Modal */}
      <AnimatePresence>
        {productTypeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative"
            >
              <button
                onClick={() => setProductTypeModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-bold mb-2 text-center">Choose your product</h2>
              <p className="text-gray-400 mb-8 text-center">What would you like to design today?</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => {
                    setProductTypeModalOpen(false);
                    onNewProject('card');
                  }}
                  className="group flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-white/10 rounded-xl hover:border-white/30 hover:bg-[#222] transition-all"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">NFC Card</h3>
                  <p className="text-sm text-gray-400 text-center">Standard PVC, Wood or Metal smart business card.</p>
                </button>

                <button
                  onClick={() => {
                    setProductTypeModalOpen(false);
                    onNewProject('board');
                  }}
                  className="group flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-white/10 rounded-xl hover:border-white/30 hover:bg-[#222] transition-all"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BoardIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">NFC Board</h3>
                  <p className="text-sm text-gray-400 text-center">Vertical tabletop display for businesses.</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
