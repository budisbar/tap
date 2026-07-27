import { useState, useEffect } from 'react';
import { db, User, Project, ImageAsset } from '../lib/mockDb';
import { Plus, Image as ImageIcon, Layout, Clock, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ClientPortalProps {
  user: User;
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
}

export default function ClientPortal({ user, onOpenProject, onNewProject }: ClientPortalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'images'>('projects');
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    const [userProjects, userImages] = await Promise.all([
      db.getProjectsByUser(user.id),
      db.getImagesByUser(user.id)
    ]);
    setProjects(userProjects);
    setImages(userImages);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleDeleteProjectClick = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setDeleteConfirmText('');
    setDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || deleteConfirmText !== 'CONFIRM') return;
    try {
      await db.deleteProject(user.id, projectToDelete);
      setDeleteModalOpen(false);
      setProjectToDelete(null);
      await fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 px-6 pb-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome to the tap&con design studio</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onNewProject}
              className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Design</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-8 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 text-sm font-medium tracking-wide uppercase transition-colors relative ${activeTab === 'projects' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Saved Designs
            {activeTab === 'projects' && (
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
            {activeTab === 'projects' ? (
              projects.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-[#0a0a0a]">
                  <Layout className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No designs yet</h3>
                  <p className="text-gray-400 mb-6">Head over to the Design Studio to create your first card.</p>
                  <button onClick={onNewProject} className="text-white underline hover:text-gray-300">Open Design Studio</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => onOpenProject(p.id)}
                      className="group cursor-pointer bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all hover:-translate-y-1"
                    >
                      <div className="aspect-[1.58] bg-[#111] rounded-xl mb-4 flex items-center justify-center relative overflow-hidden group-hover:bg-[#1a1a1a] transition-colors">
                        {p.previewUrl ? (
                          <img src={p.previewUrl} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <Layout className="w-8 h-8 text-gray-700" />
                        )}
                        <button
                          onClick={(e) => handleDeleteProjectClick(e, p.id)}
                          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                          title="Delete Design"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{p.name}</h3>
                      <div className="flex items-center text-xs text-gray-500 space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Last edited {new Date(p.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              images.length === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-2xl bg-[#0a0a0a]">
                  <ImageIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Image library is empty</h3>
                  <p className="text-gray-400">Images uploaded in the Design Studio will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="aspect-square bg-[#111] border border-white/10 rounded-xl overflow-hidden relative group">
                      <img src={img.url} alt="Uploaded asset" className="w-full h-full object-contain p-2" />
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
        {deleteModalOpen && (
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
                This action cannot be undone. Please type <strong>CONFIRM</strong> to delete this design permanently.
              </p>

              <div className="space-y-4">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type CONFIRM"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />

                <button
                  onClick={confirmDeleteProject}
                  disabled={deleteConfirmText !== 'CONFIRM'}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
                >
                  Delete Design
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
