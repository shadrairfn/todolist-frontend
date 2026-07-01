import React from 'react';
import { Plus } from 'lucide-react';
import './AddTask.css';

interface AddTaskProps {
  isAddingTask: boolean;
  setIsAddingTask: (isAdding: boolean) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (val: string) => void;
  newTaskDeadline: string;
  setNewTaskDeadline: (val: string) => void;
  newTaskRecurrence: string;
  setNewTaskRecurrence: (val: string) => void;
  isSubmitting: boolean;
  handleAddTask: () => void;
}

const AddTask: React.FC<AddTaskProps> = ({
  isAddingTask,
  setIsAddingTask,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskDeadline,
  setNewTaskDeadline,
  newTaskRecurrence,
  setNewTaskRecurrence,
  isSubmitting,
  handleAddTask
}) => {
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
        value={newTaskTitle}
        onChange={(e) => setNewTaskTitle(e.target.value)}
        autoFocus
        disabled={isSubmitting}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAddTask();
          if (e.key === 'Escape') setIsAddingTask(false);
        }}
      />
      <textarea 
        className="task-desc-input"
        placeholder="Description"
        value={newTaskDescription}
        onChange={(e) => setNewTaskDescription(e.target.value)}
        disabled={isSubmitting}
        rows={2}
      />
      <div className="task-form-options">
        <div className="form-group">
          <label>Deadline:</label>
          <input 
            type="datetime-local" 
            value={newTaskDeadline}
            onChange={(e) => setNewTaskDeadline(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <div className="form-group">
          <label>Repeat:</label>
          <select 
            value={newTaskRecurrence} 
            onChange={(e) => setNewTaskRecurrence(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="add-task-actions">
        <button 
          className="btn-cancel" 
          onClick={() => { 
            setIsAddingTask(false); 
            setNewTaskTitle(''); 
            setNewTaskDescription('');
            setNewTaskDeadline('');
            setNewTaskRecurrence('none');
          }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          className="btn-submit" 
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || isSubmitting}
        >
          {isSubmitting ? 'Adding...' : 'Add task'}
        </button>
      </div>
    </div>
  );
};

export default AddTask;
