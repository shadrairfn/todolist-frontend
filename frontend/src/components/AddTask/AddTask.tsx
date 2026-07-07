import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Tag } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { Label, Project, TodoPayload, TodoPriority, TodoStatus } from '../../types/todo';
import './AddTask.css';

interface AddTaskProps {
  projects: Project[];
  labels: Label[];
  isSubmitting: boolean;
  onAddTask: (payload: TodoPayload, labelIds: string[]) => Promise<void>;
}

const recurrenceOptions = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const;

const toLocalISOString = (date: Date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
};

const AddTask: React.FC<AddTaskProps> = ({ projects, labels, isSubmitting, onAddTask }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [dueAt, setDueAt] = useState<Date | null>(null);
  const [reminderAt, setReminderAt] = useState<Date | null>(null);
  const [recurrence, setRecurrence] = useState<(typeof recurrenceOptions)[number]>('none');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [projectId, setProjectId] = useState('');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const selectedLabels = useMemo(
    () => labels.filter(label => selectedLabelIds.includes(label.id)),
    [labels, selectedLabelIds],
  );

  useEffect(() => {
    const openForm = () => setIsAddingTask(true);
    window.addEventListener('open-add-task', openForm);
    return () => window.removeEventListener('open-add-task', openForm);
  }, []);

  const reset = () => {
    setTitle('');
    setDescription('');
    setStartAt(null);
    setDueAt(null);
    setReminderAt(null);
    setRecurrence('none');
    setPriority('medium');
    setStatus('todo');
    setProjectId('');
    setSelectedLabelIds([]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !startAt || !dueAt) return;

    await onAddTask(
      {
        title: title.trim(),
        description: description.trim() || null,
        start_at: startAt ? toLocalISOString(startAt) : null,
        due_at: dueAt ? toLocalISOString(dueAt) : null,
        reminder_at: reminderAt ? toLocalISOString(reminderAt) : null,
        priority,
        status,
        project_id: projectId || null,
        completed: status === 'done',
        is_daily: recurrence === 'daily',
        is_weekly: recurrence === 'weekly',
        is_monthly: recurrence === 'monthly',
        is_yearly: recurrence === 'yearly',
      },
      selectedLabelIds,
    );

    reset();
    setIsAddingTask(false);
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds(prev =>
      prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId],
    );
  };

  if (!isAddingTask) {
    return (
      <button className="add-task-inline" onClick={() => setIsAddingTask(true)}>
        <Plus size={16} /> Add task
      </button>
    );
  }

  return (
    <div className="add-task-form">
      <input
        type="text"
        className="task-title-input"
        placeholder="Task name"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        autoFocus
        disabled={isSubmitting}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) handleSubmit();
          if (event.key === 'Escape') setIsAddingTask(false);
        }}
      />
      <textarea
        className="task-desc-input"
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        disabled={isSubmitting}
        rows={2}
      />

      <div className="task-form-options">
        <label className="form-group date-picker-group">
          <span>Start</span>
          <DatePicker 
            selected={startAt} 
            onChange={(date: Date | null) => setStartAt(date)} 
            showTimeSelect 
            dateFormat="MMM d, yyyy h:mm aa" 
            placeholderText="Select start" 
            disabled={isSubmitting}
            className="date-picker-input"
            isClearable
          />
        </label>
        <label className="form-group date-picker-group">
          <span>Due</span>
          <DatePicker 
            selected={dueAt} 
            onChange={(date: Date | null) => setDueAt(date)} 
            showTimeSelect 
            dateFormat="MMM d, yyyy h:mm aa" 
            placeholderText="Select due" 
            disabled={isSubmitting}
            className="date-picker-input"
            isClearable
          />
        </label>
        <label className="form-group date-picker-group">
          <span>Reminder</span>
          <DatePicker 
            selected={reminderAt} 
            onChange={(date: Date | null) => setReminderAt(date)} 
            showTimeSelect 
            dateFormat="MMM d, yyyy h:mm aa" 
            placeholderText="Set reminder" 
            disabled={isSubmitting}
            className="date-picker-input"
            isClearable
          />
        </label>
        <label className="form-group">
          <span>Repeat</span>
          <select value={recurrence} onChange={(event) => setRecurrence(event.target.value as (typeof recurrenceOptions)[number])} disabled={isSubmitting}>
            {recurrenceOptions.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="form-group">
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value as TodoPriority)} disabled={isSubmitting}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="form-group">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as TodoStatus)} disabled={isSubmitting}>
            <option value="todo">Todo</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label className="form-group">
          <span>Project</span>
          <select value={projectId} onChange={(event) => setProjectId(event.target.value)} disabled={isSubmitting}>
            <option value="">Inbox</option>
            {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
      </div>

      {labels.length > 0 && (
        <div className="label-picker" aria-label="Labels">
          {labels.map(label => (
            <button
              type="button"
              key={label.id}
              className={`label-pick ${selectedLabelIds.includes(label.id) ? 'selected' : ''}`}
              onClick={() => toggleLabel(label.id)}
              disabled={isSubmitting}
            >
              <Tag size={12} style={{ color: label.color || 'var(--c-blue)' }} />
              {label.name}
            </button>
          ))}
        </div>
      )}

      {selectedLabels.length > 0 && (
        <div className="selected-labels">
          {selectedLabels.map(label => <span key={label.id}>{label.name}</span>)}
        </div>
      )}

      <div className="add-task-actions">
        <button
          className="btn-cancel"
          onClick={() => {
            reset();
            setIsAddingTask(false);
          }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button className="btn-submit" onClick={handleSubmit} disabled={!title.trim() || !startAt || !dueAt || isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add task'}
        </button>
      </div>
    </div>
  );
};

export default AddTask;
