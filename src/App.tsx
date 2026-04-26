import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Briefcase, User, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';

type Category = 'Work' | 'Private';

interface Todo {
  id: string;
  text: string;
  deadline: string;
  category: Category;
  completed: boolean;
  createdAt: number;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTab, setActiveTab] = useState<Category>('Work');
  const [newTodo, setNewTodo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  // Load from localStorage for prototype persistence
  useEffect(() => {
    const saved = localStorage.getItem('todos-prototype');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos-prototype', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: Todo = {
      id: crypto.randomUUID(),
      text: newTodo,
      deadline: deadline || format(new Date(), 'yyyy-MM-dd'),
      category: activeTab,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([todo, ...todos]);
    setNewTodo('');
    setDeadline('');
    setIsInputExpanded(false);
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const filteredTodos = todos
    .filter(t => t.category === activeTab)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return parseISO(a.deadline).getTime() - parseISO(b.deadline).getTime();
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 transition-colors duration-500">
      <div className="max-w-md mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Focus
            </h1>
            <p className="text-slate-500 text-sm">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>
          <div className="flex bg-slate-200/50 p-1 rounded-xl glass">
            {(['Work', 'Private'] as Category[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-white shadow-sm text-primary scale-105' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'Work' ? <Briefcase size={16} /> : <User size={16} />}
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Add Todo Section */}
        <div className={`mb-8 transition-all duration-300 ${isInputExpanded ? 'scale-100' : 'scale-98'}`}>
          <form onSubmit={addTodo} className="glass rounded-2xl p-4 shadow-xl shadow-indigo-100/20 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Add a ${activeTab.toLowerCase()} task...`}
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onFocus={() => setIsInputExpanded(true)}
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button 
                type="submit"
                disabled={!newTodo.trim()}
                className="bg-primary hover:bg-primary-dark text-white p-2 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
              >
                <Plus size={24} />
              </button>
            </div>
            
            {isInputExpanded && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={16} />
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1 text-right">
                  <button 
                    type="button"
                    onClick={() => setIsInputExpanded(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 uppercase tracking-wider font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Todo List */}
        <main className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-slate-300" />
              </div>
              <p className="text-slate-400">No {activeTab.toLowerCase()} tasks yet</p>
            </div>
          ) : (
            filteredTodos.map(todo => {
              const isOverdue = !todo.completed && isPast(parseISO(todo.deadline)) && format(new Date(), 'yyyy-MM-dd') !== todo.deadline;
              
              return (
                <div 
                  key={todo.id}
                  className={`group flex items-center gap-4 p-4 glass rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-100/10 border border-white/10 ${
                    todo.completed ? 'opacity-60 grayscale-[0.5]' : ''
                  }`}
                >
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className={`transition-colors duration-300 ${todo.completed ? 'text-primary' : 'text-slate-300 hover:text-primary'}`}
                  >
                    {todo.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-medium truncate transition-all ${
                      todo.completed ? 'line-through text-slate-400' : 'text-slate-700'
                    }`}>
                      {todo.text}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isOverdue 
                          ? 'bg-red-50 text-red-500' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Clock size={10} />
                        {isOverdue ? 'Overdue' : format(parseISO(todo.deadline), 'MMM d')}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          )}
        </main>

        {/* Footer info for Mobile */}
        <footer className="mt-12 text-center text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
          Clickable Prototype v1.0 • No DB Required
        </footer>
      </div>
    </div>
  );
};

export default App;
