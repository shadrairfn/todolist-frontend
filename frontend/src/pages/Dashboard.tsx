import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import TaskList, { type Todo } from '../components/TaskList/TaskList';
import AddTask from '../components/AddTask/AddTask';
import AgenticAiSlider from '../components/AgenticAiSlider/AgenticAiSlider';
import { fetchWithAuth } from '../utils/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'today' | 'upcoming'>('today');
  
  // Add task states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskRecurrence, setNewTaskRecurrence] = useState('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/todos/');

      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsSubmitting(true);

    const payload: any = {
      title: newTaskTitle,
      description: newTaskDescription || null,
      deadline: newTaskDeadline ? new Date(newTaskDeadline).toISOString() : null,
      is_daily: newTaskRecurrence === 'daily',
      is_weekly: newTaskRecurrence === 'weekly',
      is_monthly: newTaskRecurrence === 'monthly',
      is_yearly: newTaskRecurrence === 'yearly'
    };

    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/todos/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const newTodo = await response.json();
        setTodos(prev => [...prev, newTodo]);
        // Reset form
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDeadline('');
        setNewTaskRecurrence('none');
        setIsAddingTask(false);
      } else {
        console.error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/todos/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id));
      } else {
        console.error("Failed to delete task");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateTodo = async (id: string, updates: Partial<Todo>) => {
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        const updatedTodo = await response.json();
        setTodos(prev => prev.map(todo => (todo.id === id ? updatedTodo : todo)));
      } else {
        console.error("Failed to update task");
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchTodos();
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/todos/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setTodos(data);
      }
    } catch (error) {
      console.error("Error searching todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} onSearch={handleSearch} />

      <main className="main-content">
        <header className="content-header">
          <h1>{currentView === 'today' ? 'Today' : 'Upcoming'}</h1>
        </header>

        <div className="task-section">
          <h2>My Projects</h2>
          <TaskList 
            todos={todos} 
            isLoading={isLoading} 
            currentView={currentView} 
            onDelete={handleDeleteTodo}
            onUpdate={handleUpdateTodo}
          />
          <AddTask 
            isAddingTask={isAddingTask}
            setIsAddingTask={setIsAddingTask}
            newTaskTitle={newTaskTitle}
            setNewTaskTitle={setNewTaskTitle}
            newTaskDescription={newTaskDescription}
            setNewTaskDescription={setNewTaskDescription}
            newTaskDeadline={newTaskDeadline}
            setNewTaskDeadline={setNewTaskDeadline}
            newTaskRecurrence={newTaskRecurrence}
            setNewTaskRecurrence={setNewTaskRecurrence}
            isSubmitting={isSubmitting}
            handleAddTask={handleAddTask}
          />
        </div>
      </main>

      <AgenticAiSlider onActionConfirmed={fetchTodos} />
    </div>
  );
};

export default Dashboard;
