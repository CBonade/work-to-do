import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Navigation from './components/Navigation';
import TodoItem from './components/TodoItem';
import AddTodo from './components/AddTodo';
import TagModal from './components/TagModal';
import EditTodoModal from './components/EditTodoModal';
import LoginPage from './components/LoginPage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from './contexts/AuthContext';
import { todoService, tagService } from './services/todoService';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const [currentContext, setCurrentContext] = useState('work');

  // Data state
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);
  const [tags, setTags] = useState([]);

  // UI state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDoneSectionCollapsed, setIsDoneSectionCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data when user changes or context changes
  useEffect(() => {
    if (user && !loading) {
      loadData();

      // Check if we need to migrate localStorage data
      if (!hasMigrated) {
        migrateLocalStorageData();
        setHasMigrated(true);
      }
    }
  }, [user, currentContext, loading]);

  // Save current context to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('currentContext', currentContext);
    }
  }, [currentContext, user]);

  // Load current context from localStorage
  useEffect(() => {
    if (user) {
      const savedContext = localStorage.getItem('currentContext');
      if (savedContext && (savedContext === 'work' || savedContext === 'personal')) {
        setCurrentContext(savedContext);
      }
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [todosData, doneTodosData, tagsData] = await Promise.all([
        todoService.getTodos(user.id, currentContext),
        todoService.getCompletedTodos(user.id, currentContext),
        tagService.getTags(user.id, currentContext)
      ]);

      setTodos(todosData);
      setDoneTodos(doneTodosData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const migrateLocalStorageData = async () => {
    if (!user) return;

    try {
      // Check if user already has data in Supabase
      const existingTodos = await todoService.getTodos(user.id, 'work');
      const existingTags = await tagService.getTags(user.id, 'work');

      if (existingTodos.length > 0 || existingTags.length > 0) {
        // User already has data, skip migration
        return;
      }

      // Migrate localStorage data to work context
      const legacyTodos = JSON.parse(localStorage.getItem('work_todos') || localStorage.getItem('todos') || '[]');
      const legacyDoneTodos = JSON.parse(localStorage.getItem('work_doneTodos') || localStorage.getItem('doneTodos') || '[]');
      const legacyTags = JSON.parse(localStorage.getItem('work_tags') || localStorage.getItem('tags') || '[]');

      if (legacyTodos.length > 0 || legacyDoneTodos.length > 0 || legacyTags.length > 0) {
        console.log('Migrating localStorage data to Supabase...');

        // Migrate tags first (todos reference them)
        if (legacyTags.length > 0) {
          await tagService.bulkCreateTags(user.id, 'work', legacyTags);
        }

        // Migrate active todos
        if (legacyTodos.length > 0) {
          await todoService.bulkCreateTodos(user.id, 'work', legacyTodos);
        }

        // Migrate completed todos
        if (legacyDoneTodos.length > 0) {
          await todoService.bulkCreateTodos(user.id, 'work', legacyDoneTodos);
        }

        console.log('Migration complete!');

        // Reload data to show migrated items
        await loadData();
      }
    } catch (error) {
      console.error('Error migrating data:', error);
    }
  };

  const addTodo = async (todoData) => {
    if (!user) return;

    try {
      const newTodo = await todoService.createTodo(user.id, currentContext, todoData);
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const markTodoDone = async (id) => {
    try {
      const updatedTodo = await todoService.markTodoCompleted(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      setDoneTodos(prev => [...prev, updatedTodo]);
    } catch (error) {
      console.error('Error marking todo done:', error);
    }
  };

  const markTodoUndone = async (id) => {
    try {
      const updatedTodo = await todoService.markTodoUncompleted(id);
      setDoneTodos(prev => prev.filter(t => t.id !== id));
      setTodos(prev => [...prev, updatedTodo]);
    } catch (error) {
      console.error('Error marking todo undone:', error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await todoService.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      setDoneTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todos.findIndex(item => item.id === active.id);
      const newIndex = todos.findIndex(item => item.id === over.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      // TODO: If you want to persist the order, you could add an 'order' field to the database
    }
  };

  const addTag = async (tagData) => {
    if (!user) return;

    try {
      const newTag = await tagService.createTag(user.id, currentContext, tagData);
      setTags(prev => [...prev, newTag]);
    } catch (error) {
      console.error('Error adding tag:', error);
      if (error.message?.includes('duplicate key')) {
        alert('A tag with this name already exists in this context.');
      }
    }
  };

  const deleteTag = async (tagId) => {
    try {
      await tagService.deleteTag(tagId);
      setTags(prev => prev.filter(tag => tag.id !== tagId));

      // Remove tag from todos and doneTodos in local state
      setTodos(prev => prev.map(todo => ({
        ...todo,
        tags: todo.tags ? todo.tags.filter(tag => tag.id !== tagId) : []
      })));
      setDoneTodos(prev => prev.map(todo => ({
        ...todo,
        tags: todo.tags ? todo.tags.filter(tag => tag.id !== tagId) : []
      })));
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const handleEditTodo = (todo) => {
    setEditTodo(todo);
    setIsEditModalOpen(true);
  };

  const saveTodoEdit = async (updatedTodo) => {
    try {
      const savedTodo = await todoService.updateTodo(updatedTodo.id, {
        text: updatedTodo.text,
        tags: updatedTodo.tags
      });

      if (savedTodo.completed) {
        setDoneTodos(prev => prev.map(todo =>
          todo.id === savedTodo.id ? savedTodo : todo
        ));
      } else {
        setTodos(prev => prev.map(todo =>
          todo.id === savedTodo.id ? savedTodo : todo
        ));
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // Helper function to render text with links
  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="todo-link"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Helper function to determine text color based on background
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  const handleContextChange = (newContext) => {
    setCurrentContext(newContext);
    setIsTagModalOpen(false);
    setIsEditModalOpen(false);
    setEditTodo(null);
  };

  // Helper function to group done todos by completion date
  const groupTodosByDate = (todos) => {
    const groups = {};

    todos.forEach(todo => {
      if (todo.completed_date) {
        const date = new Date(todo.completed_date).toLocaleDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(todo);
      }
    });

    // Sort dates with most recent first
    const sortedDates = Object.keys(groups).sort((a, b) => {
      return new Date(b) - new Date(a);
    });

    return sortedDates.map(date => ({
      date,
      todos: groups[date]
    }));
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <h1>Odd Jobs</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="App">
      <Navigation
        onOpenTagModal={() => setIsTagModalOpen(true)}
        currentContext={currentContext}
        onContextChange={handleContextChange}
      />

      <header className="App-header">
        <AddTodo onAddTodo={addTodo} tags={tags} />

        {isLoading && (
          <div className="loading-indicator">
            <p>Loading your todos...</p>
          </div>
        )}

        <div className="todo-sections">
          <div className="todo-section">
            <div className="section-header">
              <h2>To Do ({todos.length})</h2>
              <span className={`context-indicator context-${currentContext}`}>
                {currentContext === 'work' ? '💼' : '🏠'} {currentContext.charAt(0).toUpperCase() + currentContext.slice(1)}
              </span>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={todos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="todo-list">
                  {todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onMarkDone={markTodoDone}
                      onDelete={deleteTodo}
                      onEdit={handleEditTodo}
                      isDraggable={true}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          <div className="done-section">
            <div
              className="collapsible-header"
              onClick={() => setIsDoneSectionCollapsed(!isDoneSectionCollapsed)}
            >
              <h2>Done ({doneTodos.length})</h2>
              <span className="collapse-arrow">
                {isDoneSectionCollapsed ? (
                  <ExpandMoreIcon sx={{ color: 'white', fontSize: 20 }} />
                ) : (
                  <ExpandLessIcon sx={{ color: 'white', fontSize: 20 }} />
                )}
              </span>
            </div>
            {!isDoneSectionCollapsed && (
              <div className="done-todo-groups">
                {groupTodosByDate(doneTodos).map((group, index) => (
                  <div key={group.date} className="done-date-group">
                    <div className="done-date-header">
                      <h3>{group.date}</h3>
                      <span className="done-date-count">({group.todos.length})</span>
                    </div>
                    <div className="todo-list">
                      {group.todos.map((todo) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          onMarkDone={markTodoUndone}
                          onDelete={deleteTodo}
                          onEdit={handleEditTodo}
                          isDone={true}
                          isDraggable={false}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {doneTodos.length === 0 && (
                  <div className="no-done-todos">
                    No completed todos yet
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tag-filtered lists */}
          {tags.length > 0 && (
            <div className="tag-sections">
              <h2>Lists by Tag</h2>
              <div className="tag-lists-grid">
                {tags.map((tag) => {
                  const tagTodos = todos.filter(todo =>
                    todo.tags && todo.tags.some(t => t.id === tag.id)
                  );

                  if (tagTodos.length === 0) return null;

                  return (
                    <div key={tag.id} className="tag-list-section">
                      <div className="tag-list-header">
                        <span
                          className="tag-list-title"
                          style={{
                            backgroundColor: tag.color,
                            color: getContrastColor(tag.color),
                          }}
                        >
                          {tag.name}
                        </span>
                        <span className="tag-list-count">({tagTodos.length})</span>
                      </div>
                      <div className="tag-todo-list">
                        {tagTodos.map((todo) => (
                          <div key={todo.id} className="tag-todo-item">
                            <span className="tag-todo-text">
                              {renderTextWithLinks(todo.text)}
                            </span>
                            {todo.tags && todo.tags.length > 1 && (
                              <div className="tag-todo-other-tags">
                                {todo.tags
                                  .filter(t => t.id !== tag.id)
                                  .map((otherTag) => (
                                    <span
                                      key={otherTag.id}
                                      className="tag-todo-other-tag"
                                      style={{
                                        backgroundColor: otherTag.color,
                                        color: getContrastColor(otherTag.color),
                                      }}
                                    >
                                      {otherTag.name}
                                    </span>
                                  ))
                                }
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={tags}
        onAddTag={addTag}
        onDeleteTag={deleteTag}
      />

      <EditTodoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        todo={editTodo}
        tags={tags}
        onSave={saveTodoEdit}
      />
    </div>
  );
}

export default App;