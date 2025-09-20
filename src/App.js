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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import './App.css';

function App() {
  const [currentContext, setCurrentContext] = useState('work');

  // Work context state
  const [workTodos, setWorkTodos] = useState([]);
  const [workDoneTodos, setWorkDoneTodos] = useState([]);
  const [workTags, setWorkTags] = useState([]);

  // Personal context state
  const [personalTodos, setPersonalTodos] = useState([]);
  const [personalDoneTodos, setPersonalDoneTodos] = useState([]);
  const [personalTags, setPersonalTags] = useState([]);

  // UI state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDoneSectionCollapsed, setIsDoneSectionCollapsed] = useState(true);

  // Current context data (computed)
  const todos = currentContext === 'work' ? workTodos : personalTodos;
  const doneTodos = currentContext === 'work' ? workDoneTodos : personalDoneTodos;
  const tags = currentContext === 'work' ? workTags : personalTags;
  const setTodos = currentContext === 'work' ? setWorkTodos : setPersonalTodos;
  const setDoneTodos = currentContext === 'work' ? setWorkDoneTodos : setPersonalDoneTodos;
  const setTags = currentContext === 'work' ? setWorkTags : setPersonalTags;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load data on mount
  useEffect(() => {
    const savedContext = localStorage.getItem('currentContext');
    if (savedContext) {
      setCurrentContext(savedContext);
    }

    // Load work data
    const savedWorkTodos = localStorage.getItem('work_todos');
    const savedWorkDoneTodos = localStorage.getItem('work_doneTodos');
    const savedWorkTags = localStorage.getItem('work_tags');

    if (savedWorkTodos) {
      setWorkTodos(JSON.parse(savedWorkTodos));
    }
    if (savedWorkDoneTodos) {
      setWorkDoneTodos(JSON.parse(savedWorkDoneTodos));
    }
    if (savedWorkTags) {
      setWorkTags(JSON.parse(savedWorkTags));
    }

    // Load personal data
    const savedPersonalTodos = localStorage.getItem('personal_todos');
    const savedPersonalDoneTodos = localStorage.getItem('personal_doneTodos');
    const savedPersonalTags = localStorage.getItem('personal_tags');

    if (savedPersonalTodos) {
      setPersonalTodos(JSON.parse(savedPersonalTodos));
    }
    if (savedPersonalDoneTodos) {
      setPersonalDoneTodos(JSON.parse(savedPersonalDoneTodos));
    }
    if (savedPersonalTags) {
      setPersonalTags(JSON.parse(savedPersonalTags));
    }

    // Migrate existing data to work context if no context-specific data exists
    if (!savedWorkTodos && !savedPersonalTodos) {
      const legacyTodos = localStorage.getItem('todos');
      const legacyDoneTodos = localStorage.getItem('doneTodos');
      const legacyTags = localStorage.getItem('tags');

      if (legacyTodos) {
        setWorkTodos(JSON.parse(legacyTodos));
      }
      if (legacyDoneTodos) {
        setWorkDoneTodos(JSON.parse(legacyDoneTodos));
      }
      if (legacyTags) {
        setWorkTags(JSON.parse(legacyTags));
      }
    }
  }, []);

  // Save context
  useEffect(() => {
    localStorage.setItem('currentContext', currentContext);
  }, [currentContext]);

  // Save work data
  useEffect(() => {
    localStorage.setItem('work_todos', JSON.stringify(workTodos));
  }, [workTodos]);

  useEffect(() => {
    localStorage.setItem('work_doneTodos', JSON.stringify(workDoneTodos));
  }, [workDoneTodos]);

  useEffect(() => {
    localStorage.setItem('work_tags', JSON.stringify(workTags));
  }, [workTags]);

  // Save personal data
  useEffect(() => {
    localStorage.setItem('personal_todos', JSON.stringify(personalTodos));
  }, [personalTodos]);

  useEffect(() => {
    localStorage.setItem('personal_doneTodos', JSON.stringify(personalDoneTodos));
  }, [personalDoneTodos]);

  useEffect(() => {
    localStorage.setItem('personal_tags', JSON.stringify(personalTags));
  }, [personalTags]);

  const addTodo = (todoData) => {
    const newTodo = {
      id: Date.now().toString(),
      text: typeof todoData === 'string' ? todoData.trim() : todoData.text,
      tags: typeof todoData === 'object' ? todoData.tags || [] : [],
      completed: false,
    };
    setTodos([...todos, newTodo]);
  };

  const markTodoDone = (id) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setTodos(todos.filter(t => t.id !== id));
      setDoneTodos([...doneTodos, {
        ...todo,
        completed: true,
        completedDate: new Date().toISOString()
      }]);
    }
  };

  const markTodoUndone = (id) => {
    const todo = doneTodos.find(t => t.id === id);
    if (todo) {
      setDoneTodos(doneTodos.filter(t => t.id !== id));
      const { completedDate, ...todoWithoutDate } = todo;
      setTodos([...todos, { ...todoWithoutDate, completed: false }]);
    }
  };

  const deleteTodo = (id, isDone = false) => {
    if (isDone) {
      setDoneTodos(doneTodos.filter(t => t.id !== id));
    } else {
      setTodos(todos.filter(t => t.id !== id));
    }
  };

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setTodos((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const addTag = (tag) => {
    setTags([...tags, tag]);
  };

  const deleteTag = (tagId) => {
    setTags(tags.filter(tag => tag.id !== tagId));
    // Remove the tag from all todos
    setTodos(todos.map(todo => ({
      ...todo,
      tags: todo.tags ? todo.tags.filter(tag => tag.id !== tagId) : []
    })));
    setDoneTodos(doneTodos.map(todo => ({
      ...todo,
      tags: todo.tags ? todo.tags.filter(tag => tag.id !== tagId) : []
    })));
  };

  const handleEditTodo = (todo) => {
    setEditTodo(todo);
    setIsEditModalOpen(true);
  };

  const saveTodoEdit = (updatedTodo) => {
    if (updatedTodo.completed) {
      setDoneTodos(doneTodos.map(todo =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      ));
    } else {
      setTodos(todos.map(todo =>
        todo.id === updatedTodo.id ? updatedTodo : todo
      ));
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
      if (todo.completedDate) {
        const date = new Date(todo.completedDate).toLocaleDateString();
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

  return (
    <div className="App">
      <Navigation
        onOpenTagModal={() => setIsTagModalOpen(true)}
        currentContext={currentContext}
        onContextChange={handleContextChange}
      />

      <header className="App-header">
        <AddTodo onAddTodo={addTodo} tags={tags} />

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
                          onDelete={(id) => deleteTodo(id, true)}
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
