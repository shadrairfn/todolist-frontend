export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TodoStatus = 'todo' | 'in_progress' | 'done' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  user_id?: string | null;
}

export interface Label {
  id: string;
  name: string;
  color?: string | null;
  user_id?: string | null;
}

export interface ChecklistItem {
  id: string;
  todo_id: string;
  title: string;
  completed: boolean;
  position: number;
}

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  start_at?: string | null;
  due_at?: string | null;
  deadline?: string | null;
  reminder_at?: string | null;
  completed: boolean;
  status: TodoStatus;
  priority: TodoPriority;
  project_id?: string | null;
  user_id?: string | null;
  is_daily: boolean;
  is_weekly: boolean;
  is_monthly: boolean;
  is_yearly: boolean;
  checklist_progress?: number;
}

export interface TodoFilters {
  q?: string;
  project_id?: string;
  label_id?: string;
  status?: TodoStatus;
  priority?: TodoPriority;
  overdue?: boolean;
  due_today?: boolean;
  due_this_week?: boolean;
}

export type TodoPayload = Partial<Omit<Todo, 'id' | 'user_id' | 'checklist_progress'>>;
