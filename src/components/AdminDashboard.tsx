import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { LayoutDashboard, Users, CreditCard, DollarSign, TrendingUp, TrendingDown, ArrowLeft, Activity, Server, Package, Lock, ChevronRight, Receipt, UsersRound, Plus, Edit2 } from 'lucide-react';
import { db, User, CRMClient, CRMClientStatus } from '../lib/mockDb';

export default function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'orders' | 'clients' | 'users'>('dashboard');
  const [realClients, setRealClients] = useState<(User & { projectsCount: number })[]>([]);
  const [crmClients, setCrmClients] = useState<CRMClient[]>([]);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  useEffect(() => {
    if (isAuthenticated && activeTab === 'users') {
      db.getAllUsers().then(async (users) => {
        const usersWithStats = await Promise.all(users.map(async u => {
          const stats = await db.getUserStats(u.id);
          return { ...u, projectsCount: stats.projectsCount };
        }));
        setRealClients(usersWithStats);
      });
    }
    if (isAuthenticated && activeTab === 'clients') {
      db.getCRMClients().then(setCrmClients);
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use base64 obfuscation so plain text credentials are not searchable in compiled bundle
    const isUserValid = btoa(username.trim()) === 'T3duZXI=';
    const isPassValid = btoa(password) === 'QnVkaXNiYXIxIw==';
    if (isUserValid && isPassValid) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials. Access denied.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden p-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] border border-white/10 rounded-3xl p-8 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">System Restricted</h1>
            <p className="text-sm text-gray-500">Please authenticate to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
                placeholder="Enter password"
              />
            </div>
            
            {error && <div className="text-rose-500 text-sm text-center bg-rose-500/10 py-2 rounded-lg">{error}</div>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors mt-4">
              Authorize Access
            </button>
          </form>

          <button onClick={onExit} className="w-full mt-4 text-gray-500 hover:text-white text-sm transition-colors text-center block">
            Return to Public Site
          </button>
        </motion.div>
      </div>
    );
  }

  const metrics = [
    { label: 'Total Revenue', value: '$124,500', change: '+14.5%', trend: 'up', icon: DollarSign },
    { label: 'Server Costs', value: '$2,140', change: '-2.4%', trend: 'down', icon: Server },
    { label: 'Active Cards', value: '18,492', change: '+22.1%', trend: 'up', icon: CreditCard },
    { label: 'Net Profit', value: '$94,200', change: '+18.2%', trend: 'up', icon: TrendingUp },
  ];

  const recentOrders = [
    { id: '#ORD-092', customer: 'Acme Corp', product: 'NFC Business Cards (x50)', status: 'Fulfilled', amount: '$1,250', date: 'Just now' },
    { id: '#ORD-091', customer: 'Jane Doe', product: 'Custom Review Stand', status: 'Processing', amount: '$45', date: '2 hours ago' },
    { id: '#ORD-090', customer: 'TechStart Inc', product: 'Enterprise NFC Bundle', status: 'Fulfilled', amount: '$3,400', date: '5 hours ago' },
  ];

  const expenses = [
    { category: 'AWS Hosting', amount: '$1,240', status: 'Paid', date: 'Oct 01' },
    { category: 'Stripe Fees', amount: '$450', status: 'Pending', date: 'Oct 05' },
    { category: 'Marketing', amount: '$2,100', status: 'Paid', date: 'Oct 12' },
  ];

  const clients = [
    { name: 'Acme Corp', email: 'contact@acme.com', cards: 150, joined: 'Jan 2024' },
    { name: 'TechStart Inc', email: 'hello@techstart.io', cards: 45, joined: 'Mar 2024' },
    { name: 'Local Coffee Co.', email: 'admin@localcoffee.co', cards: 20, joined: 'Jun 2024' },
  ];

  const SidebarItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col z-20 shrink-0">
        <div className="p-6 border-b border-white/10 flex justify-center text-white">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <SidebarItem id="expenses" label="Expenses" icon={Receipt} />
          <SidebarItem id="orders" label="Orders" icon={Package} />
          <SidebarItem id="clients" label="Clients" icon={Users} />
          <SidebarItem id="users" label="Open Accounts" icon={UsersRound} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onExit}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit System</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar p-8 h-screen">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-6xl mx-auto">
          
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
            <p className="text-gray-500">Manage your tap&con operations and data.</p>
          </header>

          {/* Render Dashboard View */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, idx) => (
                  <div key={idx} className="bg-[#111] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/5 rounded-lg"><metric.icon className="w-5 h-5 text-gray-400" /></div>
                      <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full ${metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{metric.change}</span>
                      </div>
                    </div>
                    <h3 className="text-gray-500 text-sm font-medium mb-1">{metric.label}</h3>
                    <p className="text-3xl font-bold text-white tracking-tight">{metric.value}</p>
                  </div>
                ))}
              </div>

              {/* Chart & Live Feed */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-white">Revenue vs. Costs</h2>
                  </div>
                  <div className="h-64 flex items-end justify-between space-x-2 mt-8">
                    {[40, 60, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120].map((height, i) => (
                      <div key={i} className="w-full flex flex-col justify-end space-y-1 group">
                        <div className="w-full bg-rose-500/20 rounded-t-sm group-hover:bg-rose-500/40 transition-colors" style={{ height: `${height * 0.3}%` }}></div>
                        <div className="w-full bg-blue-500/80 rounded-t-sm group-hover:bg-blue-400 transition-colors" style={{ height: `${height}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-white mb-6">Live Feed</h2>
                  <div className="space-y-4">
                    {recentOrders.map((order, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">{order.customer}</div>
                          <div className="text-xs text-gray-500">{order.product}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-300 font-mono">{order.amount}</div>
                          <div className={`text-[10px] font-bold uppercase ${order.status === 'Fulfilled' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Render Expenses View */}
          {activeTab === 'expenses' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] border border-white/10 rounded-2xl p-6">
               <h2 className="text-xl font-bold text-white mb-6">Recent Expenses</h2>
               <div className="space-y-4">
                 {expenses.map((expense, i) => (
                    <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-black/50 border border-white/5">
                      <div className="flex items-center space-x-4">
                         <div className="p-3 bg-white/5 rounded-lg"><Receipt className="w-5 h-5 text-gray-400" /></div>
                         <div>
                           <div className="font-bold text-white">{expense.category}</div>
                           <div className="text-xs text-gray-500">{expense.date}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-bold text-rose-400">{expense.amount}</div>
                         <div className="text-xs text-gray-500">{expense.status}</div>
                      </div>
                    </div>
                 ))}
               </div>
            </motion.div>
          )}

          {/* Render Orders View */}
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] border border-white/10 rounded-2xl p-6">
               <h2 className="text-xl font-bold text-white mb-6">Order Management</h2>
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-gray-500 text-sm border-b border-white/10">
                     <th className="pb-3 font-medium">Order ID</th>
                     <th className="pb-3 font-medium">Customer</th>
                     <th className="pb-3 font-medium">Product</th>
                     <th className="pb-3 font-medium">Amount</th>
                     <th className="pb-3 font-medium text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm">
                   {recentOrders.map((order, i) => (
                     <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                       <td className="py-4 text-blue-400 font-mono">{order.id}</td>
                       <td className="py-4 text-white font-medium">{order.customer}</td>
                       <td className="py-4 text-gray-400">{order.product}</td>
                       <td className="py-4 text-gray-300 font-mono">{order.amount}</td>
                       <td className="py-4 text-right">
                         <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${order.status === 'Fulfilled' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                           {order.status}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </motion.div>
          )}

          {/* Render Users View */}
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {realClients.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center text-gray-500">
                  <UsersRound className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No open accounts have been created yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {realClients.map((client, i) => (
                    <div key={client.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:border-blue-500/30 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 mb-4 flex items-center justify-center text-xl font-bold text-white shadow-inner">
                        {client.name ? client.name.charAt(0).toUpperCase() : client.email.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-bold text-white text-lg">{client.name || 'Unnamed Client'}</h3>
                      <p className="text-sm text-gray-400 mb-4">{client.email}</p>
                      
                      <div className="w-full flex justify-between pt-4 border-t border-white/10 text-sm">
                         <div className="text-left">
                           <div className="text-gray-500 text-xs">Saved Designs</div>
                           <div className="font-bold text-white">{client.projectsCount}</div>
                         </div>
                         <div className="text-right">
                           <div className="text-gray-500 text-xs">Joined</div>
                           <div className="font-bold text-white">{new Date(client.createdAt).toLocaleDateString()}</div>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Render Clients View (CRM) */}
          {activeTab === 'clients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-end mb-6">
                <button 
                  onClick={() => setIsAddClientModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Client</span>
                </button>
              </div>

              {crmClients.length === 0 ? (
                <div className="bg-[#111] border border-white/10 rounded-2xl p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No clients added yet. Start building your CRM pipeline!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {crmClients.map((client) => (
                    <div key={client.id} className="bg-[#111] border border-white/10 rounded-2xl p-6 relative group hover:border-white/30 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-white text-lg">{client.name}</h3>
                          <p className="text-sm text-gray-400">{client.email}</p>
                        </div>
                        <select 
                          value={client.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as CRMClientStatus;
                            await db.updateCRMClientStatus(client.id, newStatus);
                            setCrmClients(await db.getCRMClients());
                          }}
                          className={`text-xs font-bold uppercase px-3 py-1 rounded-full outline-none appearance-none cursor-pointer ${
                            client.status === 'Buying' ? 'bg-emerald-500/20 text-emerald-400' :
                            client.status === 'In Negotiation' ? 'bg-amber-500/20 text-amber-400' :
                            client.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          <option value="Emailed">Emailed</option>
                          <option value="In Negotiation">In Negotiation</option>
                          <option value="Buying">Buying</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10 text-xs text-gray-500 flex justify-between items-center">
                        <span>Added: {new Date(client.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(client.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </div>
      </main>

      {/* Add Client Modal */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
          >
            <h2 className="text-xl font-bold text-white mb-6">Add New Client</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                <input 
                  type="text" 
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email</label>
                <input 
                  type="email" 
                  value={newClientEmail}
                  onChange={e => setNewClientEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="contact@acme.com"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsAddClientModalOpen(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if (newClientName && newClientEmail) {
                    await db.addCRMClient({ name: newClientName, email: newClientEmail, status: 'Emailed' });
                    setCrmClients(await db.getCRMClients());
                    setIsAddClientModalOpen(false);
                    setNewClientName('');
                    setNewClientEmail('');
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors text-sm"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
