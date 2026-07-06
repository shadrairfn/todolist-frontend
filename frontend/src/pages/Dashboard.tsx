import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import TaskList from '../components/TaskList/TaskList';
import AddTask from '../components/AddTask/AddTask';
import AgenticAiSlider from '../components/AgenticAiSlider/AgenticAiSlider';
import { labelsApi } from '../services/labelsApi';
import { projectsApi } from '../services/projectsApi';
import { todosApi } from '../services/todosApi';
import type { Label, Project, Todo, TodoFilters, TodoPayload } from '../types/todo';
import CalendarView from '../components/CalendarView/CalendarView';
import './Dashboard.css';

type View = 'inbox' | 'today' | 'upcoming' | 'calendar' | 'filters' | 'project' | 'label';

const viewTitles: Record<View, string> = {
  inbox: 'Inbox',
  today: 'Today',
  upcoming: 'Upcoming',
  calendar: 'Calendar',
  filters: 'Filters',
  project: 'Project',
  label: 'Label',
};

const Dashboard: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [todoLabels, setTodoLabels] = useState<Record<string, string[]>>({});
  const [filters, setFilters] = useState<TodoFilters>({ due_today: true });
  const [currentView, setCurrentView] = useState<View>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => {
    if (filters.project_id) return projects.find(project => project.id === filters.project_id)?.name || 'Project';
    if (filters.label_id) return labels.find(label => label.id === filters.label_id)?.name || 'Label';
    if (filters.overdue) return 'Overdue';
    if (filters.due_today) return 'Due Today';
    if (filters.status) return filters.status.replace('_', ' ');
    if (filters.priority) return `${filters.priority} priority`;
    if (filters.q) return `Search: ${filters.q}`;
    return viewTitles[currentView];
  }, [currentView, filters, labels, projects]);

  const loadTodoLabels = useCallback(async (knownLabels: Label[]) => {
    if (knownLabels.length === 0) {
      setTodoLabels({});
      return;
    }

    try {
      const labelTodoLists = await Promise.all(
        knownLabels.map(async label => ({ labelId: label.id, todos: await labelsApi.todos(label.id) })),
      );
      const next: Record<string, string[]> = {};
      labelTodoLists.forEach(({ labelId, todos: labelTodos }) => {
        labelTodos.forEach(todo => {
          next[todo.id] = [...(next[todo.id] || []), labelId];
        });
      });
      setTodoLabels(next);
    } catch (error) {
      console.error('Error loading todo labels:', error);
    }
  }, []);

  const loadReferenceData = useCallback(async () => {
    const [projectData, labelData] = await Promise.all([projectsApi.list(), labelsApi.list()]);
    setProjects(projectData);
    setLabels(labelData);
    await loadTodoLabels(labelData);
    return { projectData, labelData };
  }, [loadTodoLabels]);

  const loadTodos = useCallback(async (nextFilters: TodoFilters = filters) => {
    setIsLoading(true);
    try {
      const data = await todosApi.list(nextFilters);
      setTodos(data);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const { labelData } = await loadReferenceData();
      const data = await todosApi.list(filters);
      setTodos(data);
      await loadTodoLabels(labelData);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, loadReferenceData, loadTodoLabels]);

  useEffect(() => {
    Promise.resolve().then(() => loadReferenceData()).catch(error => console.error('Error loading dashboard references:', error));
  }, [loadReferenceData]);

  useEffect(() => {
    Promise.resolve().then(() => loadTodos(filters));
  }, [loadTodos, filters]);

  const handleViewChange = (view: View, nextFilters: TodoFilters = {}) => {
    setCurrentView(view);
    setFilters(prev => ({ q: prev.q, ...nextFilters }));
  };

  const handleSearch = (query: string) => {
    setCurrentView(query.trim() ? 'filters' : 'today');
    setFilters(prev => ({ ...prev, q: query.trim() || undefined }));
  };

  const handleAddTask = async (payload: TodoPayload, labelIds: string[]) => {
    setIsSubmitting(true);
    try {
      const created = await todosApi.create(payload);
      await Promise.all(labelIds.map(labelId => todosApi.attachLabel(created.id, labelId)));
      await refreshAll();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todosApi.delete(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTodo = async (id: string, updates: TodoPayload) => {
    try {
      const updatedTodo = await todosApi.update(id, updates);
      setTodos(prev => prev.map(todo => (todo.id === id ? updatedTodo : todo)));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleAttachLabel = async (todoId: string, labelId: string) => {
    try {
      await todosApi.attachLabel(todoId, labelId);
      await loadTodoLabels(labels);
    } catch (error) {
      console.error('Error attaching label:', error);
    }
  };

  const handleDetachLabel = async (todoId: string, labelId: string) => {
    try {
      await todosApi.detachLabel(todoId, labelId);
      await loadTodoLabels(labels);
      if (filters.label_id === labelId) await loadTodos(filters);
    } catch (error) {
      console.error('Error detaching label:', error);
    }
  };

  const handleCreateProject = async (name: string) => {
    await projectsApi.create({ name });
    await refreshAll();
  };

  const handleUpdateProject = async (id: string, name: string) => {
    await projectsApi.update(id, { name });
    await refreshAll();
  };

  const handleDeleteProject = async (id: string) => {
    await projectsApi.delete(id);
    if (filters.project_id === id) setFilters({});
    await refreshAll();
  };

  const handleCreateLabel = async (name: string, color: string) => {
    await labelsApi.create({ name, color });
    await refreshAll();
  };

  const handleUpdateLabel = async (id: string, name: string, color?: string | null) => {
    await labelsApi.update(id, { name, color });
    await refreshAll();
  };

  const handleDeleteLabel = async (id: string) => {
    await labelsApi.delete(id);
    if (filters.label_id === id) setFilters({});
    await refreshAll();
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        currentView={currentView}
        filters={filters}
        projects={projects}
        labels={labels}
        onViewChange={handleViewChange}
        onSearch={handleSearch}
        onAddTaskClick={() => window.dispatchEvent(new CustomEvent('open-add-task'))}
        onCreateProject={handleCreateProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onCreateLabel={handleCreateLabel}
        onUpdateLabel={handleUpdateLabel}
        onDeleteLabel={handleDeleteLabel}
      />

      <main className="main-content">
        <header className="content-header">
          <h1>{title}</h1>
        </header>

        <div className="task-section">
          {currentView === 'calendar' ? (
            <CalendarView todos={todos} />
          ) : (
            <>
              <h2>Tasks</h2>
              <TaskList
                todos={todos}
                projects={projects}
                labels={labels}
                todoLabels={todoLabels}
                isLoading={isLoading}
                onDelete={handleDeleteTodo}
                onUpdate={handleUpdateTodo}
                onAttachLabel={handleAttachLabel}
                onDetachLabel={handleDetachLabel}
                onChecklistChanged={refreshAll}
              />
              <AddTask projects={projects} labels={labels} isSubmitting={isSubmitting} onAddTask={handleAddTask} />
            </>
          )}
        </div>
      </main>

      <AgenticAiSlider onActionConfirmed={refreshAll} />
    </div>
  );
};

export default Dashboard;
