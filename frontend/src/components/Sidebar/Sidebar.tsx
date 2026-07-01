import React from 'react';
import { PlusCircle, Search, Inbox, Calendar, CalendarDays, SlidersHorizontal, Bell, PanelLeftClose, Hash } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  currentView: 'today' | 'upcoming';
  setCurrentView: (view: 'today' | 'upcoming') => void;
  onSearch?: (query: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onSearch }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-profile">
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Denise" 
            alt="User" 
            className="user-avatar"
          />
          <span className="user-name">Denise</span>
          <span className="chevron-down">v</span>
        </div>
        <div className="header-actions">
          <Bell size={18} className="action-icon" />
          <PanelLeftClose size={18} className="action-icon" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item add-task-btn">
          <PlusCircle size={20} className="nav-icon text-red" />
          <span>Add task</span>
        </div>
        <div className="nav-item search-item" style={{ padding: '8px 12px' }}>
          <Search size={20} className="nav-icon" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            onChange={(e) => onSearch && onSearch(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              outline: 'none', 
              width: '100%',
              marginLeft: '12px'
            }}
          />
        </div>
        <div className="nav-item">
          <Inbox size={20} className="nav-icon" />
          <span>Inbox</span>
        </div>
        <div className={`nav-item ${currentView === 'today' ? 'active' : ''}`} onClick={() => setCurrentView('today')}>
          <Calendar size={20} className={`nav-icon ${currentView === 'today' ? 'text-orange' : ''}`} />
          <span>Today</span>
        </div>
        <div className={`nav-item ${currentView === 'upcoming' ? 'active' : ''}`} onClick={() => setCurrentView('upcoming')}>
          <CalendarDays size={20} className={`nav-icon ${currentView === 'upcoming' ? 'text-orange' : ''}`} />
          <span>Upcoming</span>
        </div>
        <div className="nav-item">
          <SlidersHorizontal size={20} className="nav-icon" />
          <span>Filters & Labels</span>
        </div>
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <span>My Projects</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-orange" />
          <span>Fitness</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-yellow" />
          <span>Groceries</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-blue" />
          <span>Appointments</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <span>Team</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-orange" />
          <span>New Brand</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-purple" />
          <span>Website Update</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-green" />
          <span>Product Roadmap</span>
        </div>
        <div className="nav-item">
          <Hash size={18} className="nav-icon text-pink" />
          <span>Meeting Agenda</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
