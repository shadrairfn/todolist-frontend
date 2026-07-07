import React, { useState } from 'react';
import {
  Archive,
  Bell,
  Calendar,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Edit2,
  Folder,
  Hash,
  Inbox,
  LogOut,
  Plus,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import type { Label, Project, TodoFilters, TodoStatus } from '../../types/todo';
import type { User } from '../../types/user';
import './Sidebar.css';

type View = 'inbox' | 'today' | 'upcoming' | 'calendar' | 'filters' | 'project' | 'label' | 'profile';

interface SidebarProps {
  currentView: View;
  filters: TodoFilters;
  currentUser: User | null;
  projects: Project[];
  labels: Label[];
  onViewChange: (view: View, filters?: TodoFilters) => void;
  onProfileClick: () => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onAddTaskClick: () => void;
  onCreateProject: (name: string) => Promise<void>;
  onUpdateProject: (id: string, name: string) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onCreateLabel: (name: string, color: string) => Promise<void>;
  onUpdateLabel: (id: string, name: string, color?: string | null) => Promise<void>;
  onDeleteLabel: (id: string) => Promise<void>;
}

const labelColors = ['#db4c3f', '#eb8909', '#fad000', '#246fe0', '#9c27b0', '#058527', '#e05194'];

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  filters,
  currentUser,
  projects,
  labels,
  onViewChange,
  onProfileClick,
  onLogout,
  onSearch,
  onAddTaskClick,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onCreateLabel,
  onUpdateLabel,
  onDeleteLabel,
}) => {
  const [newProject, setNewProject] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labelColors[3]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const profileName = currentUser?.name || currentUser?.email || 'Profile';

  const submitProject = async () => {
    if (!newProject.trim()) return;
    await onCreateProject(newProject.trim());
    setNewProject('');
  };

  const submitLabel = async () => {
    if (!newLabel.trim()) return;
    await onCreateLabel(newLabel.trim(), newLabelColor);
    setNewLabel('');
  };

  const quickFilter = (label: string, status?: TodoStatus, flags: TodoFilters = {}) => {
    const isActive = status
      ? filters.status === status
      : Object.entries(flags).every(([key, value]) => filters[key as keyof TodoFilters] === value);

    return (
    <div
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={() => onViewChange('filters', { status, ...flags })}
    >
      {label === 'Overdue' ? <CalendarClock size={18} className="nav-icon text-red" /> : label === 'Archived' ? <Archive size={18} className="nav-icon" /> : label === 'Done' ? <CheckCircle2 size={18} className="nav-icon text-green" /> : <SlidersHorizontal size={18} className="nav-icon text-blue" />}
      <span>{label}</span>
    </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          className={`user-profile ${currentView === 'profile' ? 'active' : ''}`}
          onClick={onProfileClick}
          role="button"
          tabIndex={0}
          title="Open profile"
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') onProfileClick();
          }}
        >
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profileName)}`}
            alt=""
            className="user-avatar"
          />
          <span className="user-name">{profileName}</span>
        </div>
        <div className="header-actions">
          <Bell size={18} className="action-icon" />
          <LogOut size={18} className="action-icon" onClick={onLogout} role="button" aria-label="Logout" />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item add-task-btn" onClick={onAddTaskClick}>
          <PlusCircle size={20} className="nav-icon text-red" />
          <span>Add task</span>
        </div>
        <label className="nav-item search-item">
          <Search size={20} className="nav-icon" />
          <input type="text" placeholder="Search tasks..." onChange={(event) => onSearch(event.target.value)} />
        </label>
        <div className={`nav-item ${currentView === 'inbox' ? 'active' : ''}`} onClick={() => onViewChange('inbox', {})}>
          <Inbox size={20} className="nav-icon" />
          <span>Inbox</span>
        </div>
        <div className={`nav-item ${currentView === 'today' ? 'active' : ''}`} onClick={() => onViewChange('today', { due_today: true })}>
          <Calendar size={20} className="nav-icon text-orange" />
          <span>Today</span>
        </div>
        <div className={`nav-item ${currentView === 'upcoming' ? 'active' : ''}`} onClick={() => onViewChange('upcoming', {due_this_week: true})}>
          <CalendarDays size={20} className="nav-icon text-orange" />
          <span>Upcoming</span>
        </div>
        <div className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => onViewChange('calendar', {})}>
          <Calendar size={20} className="nav-icon text-blue" />
          <span>Calendar</span>
        </div>
        <div className={`nav-item ${currentView === 'filters' ? 'active' : ''}`} onClick={() => onViewChange('filters', {})}>
          <SlidersHorizontal size={20} className="nav-icon" />
          <span>Filters & Labels</span>
        </div>
        {quickFilter('Overdue', undefined, { overdue: true })}
        {quickFilter('In Progress', 'in_progress')}
        {quickFilter('Done', 'done')}
        {quickFilter('Archived', 'archived')}
      </nav>

      <div className="sidebar-section">
        <div className="section-header">
          <span>Projects</span>
          <button className="mini-icon-btn" onClick={submitProject} title="Create project"><Plus size={14} /></button>
        </div>
        <div className="inline-create">
          <input value={newProject} placeholder="New project" onChange={(event) => setNewProject(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitProject()} />
        </div>
        {projects.map(project => {
          const key = `project:${project.id}`;
          const isEditing = editingKey === key;
          return (
            <div key={project.id} className={`nav-item editable-item ${filters.project_id === project.id ? 'active' : ''}`} onClick={() => !isEditing && onViewChange('project', { project_id: project.id })}>
              <Folder size={18} className="nav-icon text-blue" />
              {isEditing ? (
                <input
                  className="inline-edit-input"
                  value={editingValue}
                  autoFocus
                  onChange={(event) => setEditingValue(event.target.value)}
                  onKeyDown={async (event) => {
                    if (event.key === 'Enter' && editingValue.trim()) {
                      await onUpdateProject(project.id, editingValue.trim());
                      setEditingKey(null);
                    }
                    if (event.key === 'Escape') setEditingKey(null);
                  }}
                />
              ) : <span>{project.name}</span>}
              <div className="row-actions">
                <button title="Rename project" onClick={(event) => { event.stopPropagation(); setEditingKey(key); setEditingValue(project.name); }}><Edit2 size={13} /></button>
                <button title="Delete project" onClick={(event) => { event.stopPropagation(); if (window.confirm(`Delete project "${project.name}"?`)) onDeleteProject(project.id); }}><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sidebar-section">
        <div className="section-header">
          <span>Labels</span>
          <button className="mini-icon-btn" onClick={submitLabel} title="Create label"><Plus size={14} /></button>
        </div>
        <div className="inline-create label-create">
          <input value={newLabel} placeholder="New label" onChange={(event) => setNewLabel(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitLabel()} />
          <input type="color" value={newLabelColor} onChange={(event) => setNewLabelColor(event.target.value)} title="Label color" />
        </div>
        {labels.map(label => {
          const key = `label:${label.id}`;
          const isEditing = editingKey === key;
          return (
            <div key={label.id} className={`nav-item editable-item ${filters.label_id === label.id ? 'active' : ''}`} onClick={() => !isEditing && onViewChange('label', { label_id: label.id })}>
              <Hash size={18} className="nav-icon" style={{ color: label.color || 'var(--c-purple)' }} />
              {isEditing ? (
                <input
                  className="inline-edit-input"
                  value={editingValue}
                  autoFocus
                  onChange={(event) => setEditingValue(event.target.value)}
                  onKeyDown={async (event) => {
                    if (event.key === 'Enter' && editingValue.trim()) {
                      await onUpdateLabel(label.id, editingValue.trim(), label.color);
                      setEditingKey(null);
                    }
                    if (event.key === 'Escape') setEditingKey(null);
                  }}
                />
              ) : <span>{label.name}</span>}
              <div className="row-actions">
                <button title="Rename label" onClick={(event) => { event.stopPropagation(); setEditingKey(key); setEditingValue(label.name); }}><Edit2 size={13} /></button>
                <button title="Delete label" onClick={(event) => { event.stopPropagation(); if (window.confirm(`Delete label "${label.name}"?`)) onDeleteLabel(label.id); }}><Trash2 size={13} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
