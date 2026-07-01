import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, List, Plus, Trash2, MessageSquare, Edit2, Check } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api';
import './AgenticAiSlider.css';

interface AgenticAiSliderProps {
  onActionConfirmed: () => void;
}

const AgenticAiSlider: React.FC<AgenticAiSliderProps> = ({ onActionConfirmed }) => {
  const [isAiSliderOpen, setIsAiSliderOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'sessions'>('chat');
  const [sessions, setSessions] = useState<any[]>([]);
  const [agentSessionId, setAgentSessionId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { id: 1, role: 'ai', content: 'Hello! I am your Agentic AI assistant. How can I help you manage your tasks today?' }
  ]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const initializeAiSession = async () => {
    try {
      const sessionRes = await fetchWithAuth('http://127.0.0.1:8000/agentic/sessions');
      if (sessionRes.ok) {
        const sessionsData = await sessionRes.json();
        setSessions(sessionsData || []);
        if (sessionsData && sessionsData.length > 0) {
          const latestSession = sessionsData[sessionsData.length - 1];
          setAgentSessionId(latestSession.id);
          
          const chatRes = await fetchWithAuth(`http://127.0.0.1:8000/agentic/session/${latestSession.id}/chat`);
          if (chatRes.ok) {
             const history = await chatRes.json();
             if (history && history.length > 0) {
               const formattedMessages = history.map((msg: any) => ({
                  id: msg.id,
                  role: msg.role === 'agent' ? 'ai' : msg.role,
                  content: msg.content
               }));
               setChatMessages(formattedMessages);
             }
          }
          return;
        }
      }

      const response = await fetchWithAuth('http://127.0.0.1:8000/agentic/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: "New Chat Session" })
      });
      if (response.ok) {
        const data = await response.json();
        setSessions([data]);
        setAgentSessionId(data.id);
      }
    } catch (e) {
      console.error("Failed to initialize AI session", e);
    }
  };

  const loadSessionChat = async (id: string) => {
    try {
      setChatMessages([]);
      const chatRes = await fetchWithAuth(`http://127.0.0.1:8000/agentic/session/${id}/chat`);
      if (chatRes.ok) {
        const history = await chatRes.json();
        if (history && history.length > 0) {
          const formattedMessages = history.map((msg: any) => ({
            id: msg.id,
            role: msg.role === 'agent' ? 'ai' : msg.role,
            content: msg.content
          }));
          setChatMessages(formattedMessages);
        } else {
          setChatMessages([{ id: 1, role: 'ai', content: 'Hello! How can I help you in this session?' }]);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
  };

  const handleSwitchSession = (id: string) => {
    setAgentSessionId(id);
    setViewMode('chat');
    loadSessionChat(id);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/agentic/sessions/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (agentSessionId === id) {
          setAgentSessionId(null);
          setChatMessages([{ id: 1, role: 'ai', content: 'Session deleted. Please create a new session or select an existing one.' }]);
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const handleCreateSession = async () => {
    try {
      const response = await fetchWithAuth('http://127.0.0.1:8000/agentic/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Chat Session ${sessions.length + 1}` })
      });
      if (response.ok) {
        const newSession = await response.json();
        setSessions(prev => [...prev, newSession]);
        handleSwitchSession(newSession.id);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleRenameSessionStart = (e: React.MouseEvent, session: any) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditSessionTitle(session.title || 'Chat Session');
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 10);
  };

  const handleRenameSessionSave = async (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (!editSessionTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/agentic/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editSessionTitle })
      });
      
      if (response.ok) {
        setSessions(prev => prev.map(s => s.id === id ? { ...s, title: editSessionTitle } : s));
      }
    } catch (error) {
      console.error("Error renaming session:", error);
    } finally {
      setEditingSessionId(null);
    }
  };

  useEffect(() => {
    if (isAiSliderOpen && !agentSessionId) {
      initializeAiSession();
    }
  }, [isAiSliderOpen, agentSessionId]);

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || !agentSessionId) return;
    
    const messageText = chatInput;

    const newUserMsg = { id: Date.now(), role: 'user', content: messageText };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsAiTyping(true);
    
    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/agentic/sessions/${agentSessionId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: messageText })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: any = {
          id: Date.now(),
          role: 'ai',
          content: data.reply
        };
        if (data.requires_confirmation) {
          aiMessage.pendingAction = {
            id: data.pending_action_id,
            type: data.action_type,
            preview: data.preview
          };
        }
        setChatMessages(prev => [...prev, aiMessage]);
        
        onActionConfirmed(); // Refresh tasks automatically
      } else {
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          role: 'ai',
          content: "Sorry, I encountered an error."
        }]);
      }
    } catch (e) {
      console.error("Error communicating with AI:", e);
      setChatMessages(prev => [...prev, {
        id: Date.now(),
        role: 'ai',
        content: "Network error trying to reach AI."
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handlePendingAction = async (actionId: string, actionType: 'confirm' | 'cancel') => {
    setChatMessages(prev => prev.map(msg => {
      if (msg.pendingAction && msg.pendingAction.id === actionId) {
        return { ...msg, pendingAction: null, content: `${msg.content}\n\n[Action ${actionType}ed]` };
      }
      return msg;
    }));

    try {
      const response = await fetchWithAuth(`http://127.0.0.1:8000/agentic/pending-actions/${actionId}/${actionType}`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          role: 'ai',
          content: data.message || `Aksi berhasil di${actionType === 'confirm' ? 'konfirmasi' : 'batalkan'}.`
        }]);
        if (actionType === 'confirm') {
          onActionConfirmed();
        }
      } else {
        const err = await response.json();
        setChatMessages(prev => [...prev, {
          id: Date.now(),
          role: 'ai',
          content: `Error: ${err.detail || 'Gagal mengeksekusi aksi.'}`
        }]);
      }
    } catch (e) {
       console.error("Action error:", e);
    }
  };

  return (
    <>
      {/* AI Assistant FAB */}
      <button 
        className="ai-fab" 
        onClick={() => setIsAiSliderOpen(true)}
        title="Open Agentic AI"
      >
        <Sparkles size={24} />
      </button>

      {/* AI Slider Overlay */}
      {isAiSliderOpen && (
        <div className="ai-slider-overlay" onClick={() => setIsAiSliderOpen(false)}></div>
      )}

      {/* AI Slider Panel */}
      <div className={`ai-slider ${isAiSliderOpen ? 'open' : ''}`}>
        <div className="ai-slider-header">
          <div className="ai-slider-title">
            <Sparkles size={20} className="text-purple" />
            <h3>Agentic AI</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="ai-header-btn" 
              onClick={() => setViewMode(viewMode === 'chat' ? 'sessions' : 'chat')}
              title="Toggle Sessions List"
            >
              {viewMode === 'chat' ? <List size={20} /> : <MessageSquare size={20} />}
            </button>
            <button className="ai-header-btn" onClick={() => setIsAiSliderOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
        
        {viewMode === 'sessions' ? (
          <div className="ai-sessions-body">
            <div className="sessions-header-actions">
              <h4>Your Chat Sessions</h4>
              <button className="new-session-btn" onClick={handleCreateSession}>
                <Plus size={16} /> New Chat
              </button>
            </div>
            <div className="sessions-list">
              {sessions.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No sessions found.</div>
              ) : (
                sessions.map(session => (
                  <div 
                    key={session.id} 
                    className={`session-item ${agentSessionId === session.id ? 'active' : ''}`}
                    onClick={() => {
                      if (editingSessionId !== session.id) {
                        handleSwitchSession(session.id);
                      }
                    }}
                  >
                    <div className="session-info" style={{ flex: 1 }}>
                      <MessageSquare size={16} className="text-purple" />
                      {editingSessionId === session.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, marginRight: '16px' }}>
                          <input 
                            ref={editInputRef}
                            type="text" 
                            value={editSessionTitle}
                            onChange={(e) => setEditSessionTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSessionSave(e, session.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ flex: 1, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--c-purple)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                          />
                          <button 
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleRenameSessionSave(e, session.id); }} 
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: 'var(--c-green)', border: 'none', color: 'white', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Save"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="session-title" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {session.title || 'Chat Session'}
                        </span>
                      )}
                    </div>
                    
                    {editingSessionId !== session.id && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="delete-session-btn" onClick={(e) => handleRenameSessionStart(e, session)} title="Rename Session">
                          <Edit2 size={16} />
                        </button>
                        <button className="delete-session-btn" onClick={(e) => handleDeleteSession(e, session.id)} title="Delete Session">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="ai-chat-body">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.role}`}>
              <div className="chat-bubble">
                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                {msg.pendingAction && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '13px', marginBottom: '10px' }}>
                      <strong>Confirmation Needed:</strong><br/>
                      {msg.pendingAction.preview?.message}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handlePendingAction(msg.pendingAction.id, 'confirm')}
                        style={{ padding: '6px 12px', background: 'var(--c-green)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handlePendingAction(msg.pendingAction.id, 'cancel')}
                        style={{ padding: '6px 12px', background: 'var(--border-color)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isAiTyping && (
            <div className="chat-message ai">
              <div className="chat-bubble typing-indicator">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="ai-chat-footer">
          <input 
            type="text" 
            placeholder="Ask me anything..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
          />
          <button className="chat-send-btn" onClick={handleSendChatMessage} disabled={!chatInput.trim()}>
            <Send size={18} />
          </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AgenticAiSlider;
