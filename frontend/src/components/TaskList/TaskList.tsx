import React, { useState } from 'react';
import { Calendar, CheckCircle2, Circle, Trash2, Edit2, X, Check } from 'lucide-react';
import './TaskList.css';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  completed: boolean;
}

interface TaskListProps {
  todos: Todo[];
  isLoading: boolean;
  currentView: 'today' | 'upcoming';
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Todo>) => void;
}

const TaskList: React.FC<TaskListProps> = ({ todos, isLoading, currentView, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDesc(todo.description || '');
  };

  const handleEditSave = (id: string) => {
    if (onUpdate) {
      onUpdate(id, { title: editTitle, description: editDesc });
    }
    setEditingId(null);
  };

  if (isLoading) {
    return <div style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>Loading tasks...</div>;
  }

  const displayedTodos = todos.filter(todo => {
    if (!todo.deadline) return currentView === 'today'; // Tasks with no deadline go to Today
    
    const date = new Date(todo.deadline);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const isTodayOrEarlier = date <= today;
    return currentView === 'today' ? isTodayOrEarlier : !isTodayOrEarlier;
  });

  if (displayedTodos.length === 0) {
    return <div style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>No tasks for {currentView}. Add one above!</div>;
  }

  return (
    <>
      {displayedTodos.map(todo => (
        <div className="task-item" key={todo.id}>
          {todo.completed ? (
            <CheckCircle2 size={20} className="task-checkbox text-green" onClick={() => onUpdate && onUpdate(todo.id, { completed: false })} />
          ) : (
            <Circle size={20} className="task-checkbox" onClick={() => onUpdate && onUpdate(todo.id, { completed: true })} />
          )}
          
          <div className="task-details" style={{ flex: 1 }}>
            {editingId === todo.id ? (
              <div className="edit-form" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="edit-input" 
                  style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)' }}
                />
                <input 
                  type="text" 
                  value={editDesc} 
                  onChange={(e) => setEditDesc(e.target.value)} 
                  className="edit-input" 
                  placeholder="Description..."
                  style={{ width: '100%', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', fontSize: '12px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditSave(todo.id)} style={{ padding: '4px 8px', background: 'var(--text-green)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14}/> Save</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: '4px 8px', background: 'var(--border-color)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><X size={14}/> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <span className="task-title" style={{ textDecoration: todo.completed ? 'line-through' : 'none', color: todo.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                  {todo.title}
                </span>
                {todo.deadline && (
                  <span className="task-time text-green">
                    <Calendar size={14} /> {new Date(todo.deadline).toLocaleString()}
                  </span>
                )}
                {todo.description && (
                  <span className="task-time" style={{ color: 'var(--text-secondary)' }}>
                    {todo.description}
                  </span>
                )}
              </>
            )}
          </div>
          
          {editingId !== todo.id && (
            <div className="task-actions" style={{ display: 'flex', gap: '8px', opacity: 0.6 }}>
              <Edit2 size={16} className="action-btn" style={{ cursor: 'pointer' }} onClick={() => handleEditStart(todo)} />
              <Trash2 size={16} className="action-btn text-red" style={{ cursor: 'pointer' }} onClick={() => onDelete && onDelete(todo.id)} />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default TaskList;
