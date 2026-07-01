import React from 'react';
import { 
  PlusCircle, 
  Search, 
  Inbox, 
  Calendar, 
  CalendarDays, 
  SlidersHorizontal,
  Bell,
  PanelLeftClose,
  Hash,
  CheckCircle2,
  Circle,
  Plus
} from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const []
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
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
          <div className="nav-item">
            <Search size={20} className="nav-icon" />
            <span>Search</span>
          </div>
          <div className="nav-item">
            <Inbox size={20} className="nav-icon" />
            <span>Inbox</span>
          </div>
          <div className="nav-item active">
            <Calendar size={20} className="nav-icon text-orange" />
            <span>Today</span>
          </div>
          <div className="nav-item">
            <CalendarDays size={20} className="nav-icon" />
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

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h1>Today</h1>
        </header>

        <div className="task-section">
          <h2>My Projects</h2>
          
          <div className="task-list">
            <div className="task-item">
              <Circle size={20} className="task-checkbox" />
              <div className="task-details">
                <span className="task-title">Do 30 minutes of yoga 🧘‍♀️</span>
                <span className="task-time text-green">
                  <Calendar size={14} /> 7:30 AM ⏰
                </span>
              </div>
            </div>
            
            <div className="task-item">
              <Circle size={20} className="task-checkbox" />
              <div className="task-details">
                <span className="task-title">Dentist appointment</span>
                <span className="task-time text-green">
                  <Calendar size={14} /> 10:00 AM 🦷
                </span>
              </div>
            </div>

            <div className="task-item">
              <Circle size={20} className="task-checkbox" />
              <div className="task-details">
                <span className="task-title">Buy bread 🍞</span>
              </div>
            </div>
          </div>
          
          <button className="add-task-inline">
            <Plus size={16} /> Add task
          </button>
        </div>

        <div className="task-section">
          <h2>Team</h2>
          
          <div className="task-list">
            <div className="task-item">
              <Circle size={20} className="task-checkbox border-blue text-blue" />
              <div className="task-details">
                <span className="task-title">Plan user research sessions</span>
                <span className="task-time text-green">
                  <Calendar size={14} /> 2:00 PM <span className="calendar-tag">Calendar</span>
                </span>
              </div>
            </div>
            
            <div className="task-item">
              <Circle size={20} className="task-checkbox border-red text-red" />
              <div className="task-details">
                <span className="task-title">Provide feedback on Amy's design</span>
              </div>
            </div>

            <div className="task-item">
              <Circle size={20} className="task-checkbox border-green text-green" />
              <div className="task-details">
                <span className="task-title">All-hands meeting</span>
                <span className="task-time text-green">
                  <Calendar size={14} />
                </span>
              </div>
            </div>
          </div>

          <button className="add-task-inline">
            <Plus size={16} /> Add task
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
