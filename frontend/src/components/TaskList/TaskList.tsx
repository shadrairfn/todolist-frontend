import React, { useEffect, useMemo, useState } from 'react';
import { AlarmClock, Calendar, CalendarClock, Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Edit2, Folder, Tag, Trash2, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Checklist from '../Checklist/Checklist';
import type { Label, Project, Todo, TodoPayload, TodoPriority, TodoStatus } from '../../types/todo';
import './TaskList.css';

interface TaskListProps {
  todos: Todo[];
  projects: Project[];
  labels: Label[];
  todoLabels: Record<string, string[]>;
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, updates: TodoPayload) => Promise<void>;
  onAttachLabel: (todoId: string, labelId: string) => Promise<void>;
  onDetachLabel: (todoId: string, labelId: string) => Promise<void>;
  onChecklistChanged: () => void;
}

const toLocalISOString = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000; // offset dalam milliseconds
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, -1);
  return localISOTime;
};

const formatDate = (value?: string | null) => {
  if (!value) return '';
  return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const toInputDate = (value?: string | null) => {
  if (!value) return null;
  return value; // We will use ISO string directly with DatePicker
};

const badgeText = (value: string) => value.replace('_', ' ');
const oneHourMs = 60 * 60 * 1000;

const getTimeMs = (value?: string | null) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const getTimeTone = (todo: Todo, field: 'start' | 'due', nowMs: number) => {
  const startMs = getTimeMs(todo.start_at);
  const dueMs = getTimeMs(todo.due_at || todo.deadline);
  const targetMs = field === 'start' ? startMs : dueMs;

  if (!targetMs) return field === 'start' ? 'time-start' : 'time-due';
  if (nowMs >= targetMs) return 'time-elapsed';

  if (field === 'due' && startMs && nowMs >= startMs) {
    return 'time-running';
  }

  if (targetMs - nowMs <= oneHourMs) {
    return 'time-warning';
  }

  return field === 'start' ? 'time-start' : 'time-due';
};

const getDisplayStatus = (todo: Todo, nowMs: number): TodoStatus => {
  if (todo.completed || todo.status === 'done') return 'done';
  if (todo.status === 'archived') return 'archived';

  const startMs = getTimeMs(todo.start_at);
  if (todo.status === 'in_progress' || (startMs && nowMs >= startMs)) return 'in_progress';

  return todo.status;
};

const TaskList: React.FC<TaskListProps> = ({
  todos,
  projects,
  labels,
  todoLabels,
  isLoading,
  onDelete,
  onUpdate,
  onAttachLabel,
  onDetachLabel,
  onChecklistChanged,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<TodoPayload>({});
  const [nowMs, setNowMs] = useState(() => Date.now());

  const projectById = useMemo(() => new Map(projects.map(project => [project.id, project])), [projects]);
  const labelById = useMemo(() => new Map(labels.map(label => [label.id, label])), [labels]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleEditStart = (todo: Todo) => {
    setEditingId(todo.id);
    setEditDraft({
      title: todo.title,
      description: todo.description || '',
      start_at: toInputDate(todo.start_at),
      due_at: toInputDate(todo.due_at || todo.deadline),
      reminder_at: toInputDate(todo.reminder_at),
      status: todo.status,
      priority: todo.priority,
      project_id: todo.project_id || '',
    });
  };

  const handleEditSave = async (id: string) => {
    await onUpdate(id, {
      ...editDraft,
      title: String(editDraft.title || '').trim(),
      description: editDraft.description ? String(editDraft.description) : null,
      due_at: editDraft.due_at ? toLocalISOString(new Date(String(editDraft.due_at))) : null,
      start_at: editDraft.start_at ? toLocalISOString(new Date(String(editDraft.start_at))) : null,
      reminder_at: editDraft.reminder_at ? toLocalISOString(new Date(String(editDraft.reminder_at))) : null,
      project_id: editDraft.project_id || null,
      completed: editDraft.status === 'done', 
    });
    setEditingId(null);
  };

  if (isLoading) {
    return <div className="task-list-state">Loading tasks...</div>;
  }

  if (todos.length === 0) {
    return <div className="task-list-state">No tasks match this view.</div>;
  }

  return (
    <div className="task-list">
      {todos.map(todo => {
        const isDone = todo.completed || todo.status === 'done';
        const assignedLabelIds = todoLabels[todo.id] || [];
        const assignedLabels = assignedLabelIds.map(id => labelById.get(id)).filter(Boolean) as Label[];
        const progress = Math.round((todo.checklist_progress || 0) * 100);
        const isEditing = editingId === todo.id;
        const displayStatus = getDisplayStatus(todo, nowMs);

        return (
          <div className="task-item" key={todo.id}>
            <button className="task-checkbox" onClick={() => onUpdate(todo.id, { completed: !isDone })} title={isDone ? 'Mark incomplete' : 'Mark complete'}>
              {isDone ? <CheckCircle2 size={20} className="text-green" /> : <Circle size={20} />}
            </button>

            <div className="task-details">
              {isEditing ? (
                <div className="edit-form">
                  <input
                    type="text"
                    value={String(editDraft.title || '')}
                    onChange={(event) => setEditDraft(prev => ({ ...prev, title: event.target.value }))}
                    className="edit-input task-edit-title"
                  />
                  <textarea
                    value={String(editDraft.description || '')}
                    onChange={(event) => setEditDraft(prev => ({ ...prev, description: event.target.value }))}
                    className="edit-input"
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="edit-grid">
                    <label>Start
                      <DatePicker
                        selected={editDraft.start_at ? new Date(String(editDraft.start_at)) : null}
                        onChange={(date: Date | null) => setEditDraft(prev => ({ ...prev, start_at: date ? toLocalISOString(date) : null }))}
                        showTimeSelect
                        dateFormat="MMM d, yyyy h:mm aa"
                        className="date-picker-input edit-input"
                        isClearable
                      />
                    </label>
                    <label>Due
                      <DatePicker 
                        selected={editDraft.due_at ? new Date(String(editDraft.due_at)) : null} 
                        onChange={(date: Date | null) => setEditDraft(prev => ({ ...prev, due_at: date ? toLocalISOString(date) : null }))}
                        showTimeSelect 
                        dateFormat="MMM d, yyyy h:mm aa" 
                        className="date-picker-input edit-input"
                        isClearable
                      />
                    </label>
                    <label>Reminder
                      <DatePicker 
                        selected={editDraft.reminder_at ? new Date(String(editDraft.reminder_at)) : null} 
                        onChange={(date: Date | null) => setEditDraft(prev => ({ ...prev, reminder_at: date ? toLocalISOString(date) : null }))}
                        showTimeSelect 
                        dateFormat="MMM d, yyyy h:mm aa" 
                        className="date-picker-input edit-input"
                        isClearable
                      />
                    </label>
                    <label>Status<select value={editDraft.status as TodoStatus} onChange={(event) => setEditDraft(prev => ({ ...prev, status: event.target.value as TodoStatus }))}>
                      <option value="todo">Todo</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                      <option value="archived">Archived</option>
                    </select></label>
                    <label>Priority<select value={editDraft.priority as TodoPriority} onChange={(event) => setEditDraft(prev => ({ ...prev, priority: event.target.value as TodoPriority }))}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select></label>
                    <label>Project<select value={String(editDraft.project_id || '')} onChange={(event) => setEditDraft(prev => ({ ...prev, project_id: event.target.value }))}>
                      <option value="">Inbox</option>
                      {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select></label>
                  </div>
                  <div className="edit-actions">
                    <button className="save-btn" onClick={() => handleEditSave(todo.id)}><Check size={14} /> Save</button>
                    <button className="cancel-btn" onClick={() => setEditingId(null)}><X size={14} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="task-title-row">
                    <span className={`task-title ${isDone ? 'completed' : ''}`}>{todo.title}</span>
                    <span className={`status-badge status-${displayStatus}`}>{badgeText(displayStatus)}</span>
                    <span className={`priority-badge priority-${todo.priority}`}>{todo.priority}</span>
                  </div>
                  {todo.description && <span className="task-description">{todo.description}</span>}
                  <div className="task-meta">
                    {todo.start_at && (
                      <span className={`task-time ${getTimeTone(todo, 'start', nowMs)}`}>
                        <CalendarClock size={14} /> Start {formatDate(todo.start_at)}
                      </span>
                    )}
                    {(todo.due_at || todo.deadline) && (
                      <span className={`task-time ${getTimeTone(todo, 'due', nowMs)}`}>
                        <Calendar size={14} /> Due {formatDate(todo.due_at || todo.deadline)}
                      </span>
                    )}
                    {todo.reminder_at && <span className="task-time text-orange"><AlarmClock size={14} /> {formatDate(todo.reminder_at)}</span>}
                    {todo.project_id && projectById.get(todo.project_id) && <span className="task-time"><Folder size={14} /> {projectById.get(todo.project_id)?.name}</span>}
                  </div>
                  <div className="task-label-row">
                    {assignedLabels.map(label => (
                      <button key={label.id} className="task-label-chip" onClick={() => onDetachLabel(todo.id, label.id)} title="Detach label">
                        <Tag size={12} style={{ color: label.color || 'var(--c-purple)' }} />
                        {label.name}
                      </button>
                    ))}
                    {labels.filter(label => !assignedLabelIds.includes(label.id)).slice(0, 4).map(label => (
                      <button key={label.id} className="task-label-chip muted" onClick={() => onAttachLabel(todo.id, label.id)} title="Attach label">
                        <Tag size={12} style={{ color: label.color || 'var(--c-purple)' }} />
                        {label.name}
                      </button>
                    ))}
                  </div>
                  {todo.checklist_progress !== undefined && (
                    <div className="progress-line" title={`Checklist ${progress}%`}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  )}
                  {expandedId === todo.id && <Checklist todoId={todo.id} onChanged={onChecklistChanged} />}
                </>
              )}
            </div>

            {!isEditing && (
              <div className="task-actions">
                <button onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)} title="Checklist">
                  {expandedId === todo.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <button onClick={() => handleEditStart(todo)} title="Edit task"><Edit2 size={16} /></button>
                <button onClick={() => onDelete(todo.id)} title="Delete task"><Trash2 size={16} /></button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export type { Todo };
export default TaskList;
