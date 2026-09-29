import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  MapPin, 
  History, 
  LogOut,
  Landmark,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isRunningDemo, setIsRunningDemo] = React.useState(false);
  const latestDocId = localStorage.getItem('latest_doc_id') || 'DOC-101';

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Document', path: '/upload', icon: Upload },
    { name: 'Extraction Results', path: `/extraction/${latestDocId}`, icon: FileText },
    { name: 'Validation Results', path: `/validation/${latestDocId}`, icon: ShieldCheck },
    { name: 'Human Review', path: '/review', icon: UserCheck, badge: 'HITL' },
    { name: 'Land Records', path: '/records', icon: Landmark },
    { name: 'GIS Map', path: '/map', icon: MapPin },
    { name: 'Audit Logs', path: '/audit', icon: History },
    { name: 'Architecture & AI', path: '/architecture', icon: Layers },
  ];

  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    try {
      await api.runDemoWorkflow();
      navigate('/extraction/DOC-101');
    } catch (e) {
      console.error(e);
      navigate('/extraction/DOC-101');
    } finally {
      setIsRunningDemo(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bhu_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Professional Government Header */}
      <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg ring-2 ring-blue-400/30">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">Geo Plot</span>
                <span className="bg-blue-600/30 text-blue-300 text-xs px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
                  SIH 2024 MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Intelligent Multilingual Land Record Digitization & Validation</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Quick Demo Button */}
            <button
              onClick={handleRunDemo}
              disabled={isRunningDemo}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition-all transform active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isRunningDemo ? 'animate-spin' : ''}`} />
              <span>{isRunningDemo ? 'Executing Demo Pipeline...' : 'Run Automated Demo'}</span>
            </button>

            {/* Team Info Badge */}
            <div className="hidden lg:flex flex-col text-right text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
              <span className="font-bold text-slate-200">The Straw Hats</span>
              <span className="text-slate-400">Team ID: <strong className="text-blue-400">137647</strong></span>
            </div>

            {/* Officer Profile & Logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                RS
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-slate-200">Rajesh Sharma</p>
                <p className="text-slate-400 text-[10px]">Revenue Officer</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-3 space-y-1 sticky top-22">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation Menu
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path.startsWith('/extraction') && location.pathname.startsWith('/extraction')) ||
                (item.path.startsWith('/validation') && location.pathname.startsWith('/validation'));

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Dynamic Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Geo Plot — Smart India Hackathon Prototype</span>
          <span className="text-slate-400">Team: The Straw Hats (ID: 137647) | Govt of India Land Records Modernization</span>
        </div>
      </footer>
    </div>
  );
};
