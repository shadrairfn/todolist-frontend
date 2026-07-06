import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react';
import { checklistApi } from '../../services/checklistApi';
import type { ChecklistItem } from '../../types/todo';
import './Checklist.css';

interface ChecklistProps {
  todoId: string;
  onChanged: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ todoId, onChanged }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await checklistApi.list(todoId);
      setItems(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    Promise.resolve().then(loadItems);
  }, [loadItems]);

  const addItem = async () => {
    if (!newTitle.trim()) return;
    try {
      await checklistApi.create(todoId, { title: newTitle.trim(), position: items.length });
      setNewTitle('');
      await loadItems();
      onChanged();
    } catch (error) {
      console.error('Error adding checklist item:', error);
    }
  };

  const updateItem = async (itemId: string, payload: Partial<Pick<ChecklistItem, 'title' | 'completed'>>) => {
    try {
      await checklistApi.update(todoId, itemId, payload);
      await loadItems();
      onChanged();
    } catch (error) {
      console.error('Error updating checklist item:', error);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await checklistApi.delete(todoId, itemId);
      await loadItems();
      onChanged();
    } catch (error) {
      console.error('Error deleting checklist item:', error);
    }
  };

  return (
    <div className="checklist-panel">
      {isLoading ? (
        <div className="checklist-empty">Loading checklist...</div>
      ) : items.length === 0 ? (
        <div className="checklist-empty">No checklist items yet.</div>
      ) : (
        items.map(item => (
          <div className="checklist-row" key={item.id}>
            <button className="checklist-toggle" onClick={() => updateItem(item.id, { completed: !item.completed })} title="Toggle item">
              {item.completed ? <CheckCircle2 size={16} className="text-green" /> : <Circle size={16} />}
            </button>
            {editingId === item.id ? (
              <input
                value={editingTitle}
                autoFocus
                onChange={(event) => setEditingTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && editingTitle.trim()) {
                    updateItem(item.id, { title: editingTitle.trim() });
                    setEditingId(null);
                  }
                  if (event.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <button className={`checklist-title ${item.completed ? 'completed' : ''}`} onClick={() => { setEditingId(item.id); setEditingTitle(item.title); }}>
                {item.title}
              </button>
            )}
            <button className="checklist-icon" onClick={() => deleteItem(item.id)} title="Delete item"><Trash2 size={14} /></button>
          </div>
        ))
      )}

      <div className="checklist-add">
        <Plus size={14} />
        <input
          value={newTitle}
          placeholder="Add checklist item"
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addItem();
            if (event.key === 'Escape') setNewTitle('');
          }}
        />
        {newTitle && <button onClick={() => setNewTitle('')} title="Clear"><X size={14} /></button>}
      </div>
    </div>
  );
};

export default Checklist;
