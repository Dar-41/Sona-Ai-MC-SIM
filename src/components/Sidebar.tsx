import React from 'react';
import { 
  LayoutGrid, 
  TrendingUp, 
  Sliders, 
  FileSpreadsheet, 
  Target, 
  ShieldAlert, 
  Settings, 
  HelpCircle, 
  Sparkles,
  Search,
  Zap,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenDocModal: () => void;
  onOpenParams: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isHighPerfMode: boolean;
  setIsHighPerfMode: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenDocModal,
  onOpenParams,
  isOpen,
  setIsOpen,
  isHighPerfMode,
  setIsHighPerfMode,
}) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'simulation', label: 'Live Simulation', icon: TrendingUp },
    { id: 'parameters', label: 'Parameters', icon: Sliders, onClick: onOpenParams },
    { id: 'documents', label: 'Doc Parser', icon: FileSpreadsheet, onClick: onOpenDocModal },
    { id: 'goals', label: 'Saving Goals', icon: Target },
    { id: 'analytics', label: 'Risk Analytics', icon: ShieldAlert },
  ];

  const toolsItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0E0F15] border-r border-[#1F222E] 
        flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Top Logo & Search */}
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between px-2 mb-6 pt-2">
            <div className="flex items-center gap-3">
              {/* Sona AI signature icon */}
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5722] to-[#FF7043] flex items-center justify-center shadow-glow-orange">
                <span className="font-black text-sm text-white tracking-tighter">S</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white font-sans">Sona Ai</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FF5722]/20 text-[#FF5722] border border-[#FF5722]/30">MC SIM</span>
                </div>
                <p className="text-[10px] text-[#6B7280]">Stochastic Intelligence</p>
              </div>
            </div>

            {/* Close button on mobile */}
            <button 
              className="lg:hidden text-[#8E95A8] hover:text-white p-1 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6 px-1">
            <Search className="absolute left-3.5 top-2.5 text-[#5D6375]" size={16} />
            <input 
              type="text"
              placeholder="Search parameters, runs..." 
              className="w-full bg-[#14161F] border border-[#1F222E] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#5D6375] focus:outline-none focus:border-[#FF5722]/50 focus:ring-1 focus:ring-[#FF5722]/40 transition-colors"
            />
          </div>

          {/* Menu Section */}
          <div className="mb-6">
            <p className="text-[11px] font-semibold tracking-wider text-[#505566] uppercase px-3 mb-2">
              Menu
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.onClick) {
                        item.onClick();
                      } else {
                        setActiveTab(item.id);
                      }
                      setIsOpen(false);
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all
                      ${isActive 
                        ? 'bg-[#181A24] text-white shadow-sm border border-[#262A3B]' 
                        : 'text-[#8E95A8] hover:text-white hover:bg-[#13151E]'
                      }
                    `}
                  >
                    <Icon size={18} className={isActive ? 'text-[#FF5722]' : 'text-[#62687A]'} />
                    <span>{item.label}</span>
                    {item.id === 'documents' && (
                      <span className="ml-auto text-[10px] bg-[#222533] text-[#A0A6B8] px-1.5 py-0.5 rounded font-mono">
                        XLS/PDF
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tools Section */}
          <div>
            <p className="text-[11px] font-semibold tracking-wider text-[#505566] uppercase px-3 mb-2">
              Tools
            </p>
            <nav className="space-y-1">
              {toolsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-[#8E95A8] hover:text-white hover:bg-[#13151E] transition-colors"
                  >
                    <Icon size={18} className="text-[#62687A]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Info (Promotional card completely removed) */}
        <div className="pt-4">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-[#141620] border border-[#1F222E]">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF5722] via-[#F4511E] to-[#7C4DFF] flex items-center justify-center font-bold text-xs text-white shadow-glow-orange border border-white/20">
                DS
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0E0F15]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white tracking-wide truncate">DARSH SHETH</p>
              <p className="text-[10px] text-[#8E95A8] truncate font-medium">Portfolio Manager • Sona AI</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
