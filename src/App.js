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
import AddTodoModal from './components/AddTodoModal';
import FloatingAddButton from './components/FloatingAddButton';
import TagModal from './components/TagModal';
import EditTodoModal from './components/EditTodoModal';
import WeeklyTaskModal from './components/WeeklyTaskModal';
import WeeklyTaskItem from './components/WeeklyTaskItem';
import FollowUpModal from './components/FollowUpModal';
import LoginPage from './components/LoginPage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAuth } from './contexts/AuthContext';
import { todoService, tagService, weeklyTaskService, agendaService } from './services/todoService';
import './App.css';

function App() {
  const { user, loading } = useAuth();
  const [currentContext, setCurrentContext] = useState('work');

  // Data state
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);
  const [wontDoTodos, setWontDoTodos] = useState([]);
  const [tags, setTags] = useState([]);
  const [weeklyTasks, setWeeklyTasks] = useState([]);
  const [agendas, setAgendas] = useState([]);

  // UI state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeeklyTaskModalOpen, setIsWeeklyTaskModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [followUpInitialText, setFollowUpInitialText] = useState('');
  const [isDoneSectionCollapsed, setIsDoneSectionCollapsed] = useState(true);
  const [isWontDoSectionCollapsed, setIsWontDoSectionCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [swappingAnimation, setSwappingAnimation] = useState(null);

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

  // Check for new day and reset weekly tasks if needed
  useEffect(() => {
    if (!user || weeklyTasks.length === 0) return;

    const checkForNewDay = async () => {
      const today = new Date().toDateString();
      const lastResetKey = `lastWeeklyReset_${user.id}_${currentContext}`;
      const lastReset = localStorage.getItem(lastResetKey);

      if (lastReset !== today) {
        // It's a new day, reset all weekly tasks
        try {
          await weeklyTaskService.resetWeeklyTasks(user.id, currentContext);
          // Update local state
          setWeeklyTasks(prev => prev.map(task => ({
            ...task,
            completed_this_week: false
          })));
          // Store today as the last reset date
          localStorage.setItem(lastResetKey, today);
        } catch (error) {
          console.error('Error resetting weekly tasks:', error);
        }
      }
    };

    checkForNewDay();
  }, [user, currentContext, weeklyTasks]);

  const loadData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      if (currentContext === 'agendas') {
        // Only load agendas data for agendas view
        const agendasData = await agendaService.getAgendas(user.id, 'work'); // Load work agendas by default
        setAgendas(agendasData);
        setTodos([]);
        setDoneTodos([]);
        setWontDoTodos([]);
        setTags([]);
        setWeeklyTasks([]);
      } else {
        // Load todo-related data for work/personal contexts
        const [todosData, doneTodosData, wontDoTodosData, tagsData, weeklyTasksData] = await Promise.all([
          todoService.getTodos(user.id, currentContext),
          todoService.getCompletedTodos(user.id, currentContext),
          todoService.getWontDoTodos(user.id, currentContext),
          tagService.getTags(user.id, currentContext),
          weeklyTaskService.getWeeklyTasks(user.id, currentContext)
        ]);

        setTodos(sortTodosWithDeadlines(todosData));
        setDoneTodos(doneTodosData);
        setWontDoTodos(wontDoTodosData);
        setTags(tagsData);
        setWeeklyTasks(weeklyTasksData);
        setAgendas([]); // Clear agendas when not in agendas view
      }
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
      setTodos(prev => sortTodosWithDeadlines([...prev, newTodo]));
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
      setWontDoTodos(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const markTodoWontDo = async (id) => {
    try {
      const updatedTodo = await todoService.markTodoWontDo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      setWontDoTodos(prev => [...prev, updatedTodo]);
    } catch (error) {
      console.error('Error marking todo won\'t do:', error);
    }
  };

  const markTodoWillDo = async (id) => {
    try {
      const updatedTodo = await todoService.markTodoWillDo(id);
      setWontDoTodos(prev => prev.filter(t => t.id !== id));
      setTodos(prev => sortTodosWithDeadlines([...prev, updatedTodo]));
    } catch (error) {
      console.error('Error marking todo will do:', error);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todos.findIndex(item => item.id === active.id);
      const newIndex = todos.findIndex(item => item.id === over.id);

      const newTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(newTodos);

      // Persist the new order to database
      try {
        await todoService.updateTodoOrder(newTodos);
      } catch (error) {
        console.error('Error saving todo order:', error);
      }
    }
  };

  const handleMoveUp = async (todoId) => {
    const currentIndex = todos.findIndex(item => item.id === todoId);
    if (currentIndex > 0) {
      const targetTodo = todos[currentIndex - 1];

      // Start swap animation
      animateSwap(todoId, targetTodo.id, 'up');

      // Update state immediately for data consistency but animations will handle visual
      const newTodos = arrayMove(todos, currentIndex, currentIndex - 1);

      // Wait for animation to complete before updating state to prevent jerking
      setTimeout(() => {
        setTodos(newTodos);

        // Persist the new order to database
        todoService.updateTodoOrder(newTodos).catch(error => {
          console.error('Error saving todo order:', error);
        });
      }, 400); // Match animation duration
    }
  };

  const handleMoveDown = async (todoId) => {
    const currentIndex = todos.findIndex(item => item.id === todoId);
    if (currentIndex < todos.length - 1) {
      const targetTodo = todos[currentIndex + 1];

      // Start swap animation
      animateSwap(todoId, targetTodo.id, 'down');

      // Update state immediately for data consistency but animations will handle visual
      const newTodos = arrayMove(todos, currentIndex, currentIndex + 1);

      // Wait for animation to complete before updating state to prevent jerking
      setTimeout(() => {
        setTodos(newTodos);

        // Persist the new order to database
        todoService.updateTodoOrder(newTodos).catch(error => {
          console.error('Error saving todo order:', error);
        });
      }, 400); // Match animation duration
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

      // Remove tag from todos, doneTodos, and wontDoTodos in local state
      setTodos(prev => prev.map(todo => ({
        ...todo,
        tags: todo.tags ? todo.tags.filter(tag => tag.id !== tagId) : []
      })));
      setDoneTodos(prev => prev.map(todo => ({
        ...todo,
        tags: todo.tags ? todo.tags.filter(tag => tag.id !== tagId) : []
      })));
      setWontDoTodos(prev => prev.map(todo => ({
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
        tags: updatedTodo.tags,
        deadline: updatedTodo.deadline
      });

      if (savedTodo.completed) {
        setDoneTodos(prev => prev.map(todo =>
          todo.id === savedTodo.id ? savedTodo : todo
        ));
      } else if (savedTodo.wont_do) {
        setWontDoTodos(prev => prev.map(todo =>
          todo.id === savedTodo.id ? savedTodo : todo
        ));
      } else {
        setTodos(prev => sortTodosWithDeadlines(
          prev.map(todo => todo.id === savedTodo.id ? savedTodo : todo)
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
    setIsWeeklyTaskModalOpen(false);
    setEditTodo(null);
  };

  // Weekly task handlers
  const addWeeklyTask = async (taskData) => {
    if (!user) return;

    try {
      const newTask = await weeklyTaskService.createWeeklyTask(user.id, currentContext, taskData);
      setWeeklyTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Error adding weekly task:', error);
    }
  };

  const deleteWeeklyTask = async (taskId) => {
    try {
      await weeklyTaskService.deleteWeeklyTask(taskId);
      setWeeklyTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting weekly task:', error);
    }
  };

  const markWeeklyTaskCompleted = async (taskId) => {
    try {
      const updatedTask = await weeklyTaskService.markWeeklyTaskCompleted(taskId);
      setWeeklyTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error marking weekly task completed:', error);
    }
  };

  const markWeeklyTaskIncomplete = async (taskId) => {
    try {
      const updatedTask = await weeklyTaskService.markWeeklyTaskIncomplete(taskId);
      setWeeklyTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Error marking weekly task incomplete:', error);
    }
  };

  // Agenda handlers
  const addAgenda = async (agendaData) => {
    if (!user) return;

    try {
      // Always create agendas in 'work' context since agendas are context-independent
      const newAgenda = await agendaService.createAgenda(user.id, 'work', agendaData);
      setAgendas(prev => [newAgenda, ...prev]);
    } catch (error) {
      console.error('Error adding agenda:', error.message || error);
      console.error('Full error object:', error);
    }
  };

  const deleteAgenda = async (agendaId) => {
    try {
      await agendaService.deleteAgenda(agendaId);
      setAgendas(prev => prev.filter(agenda => agenda.id !== agendaId));
    } catch (error) {
      console.error('Error deleting agenda:', error);
    }
  };

  const updateAgenda = async (agendaId, updates) => {
    try {
      const updatedAgenda = await agendaService.updateAgenda(agendaId, updates);
      setAgendas(prev => prev.map(agenda =>
        agenda.id === agendaId ? { ...agenda, ...updatedAgenda } : agenda
      ));
    } catch (error) {
      console.error('Error updating agenda:', error);
    }
  };

  const addAgendaItem = async (agendaId, itemText) => {
    try {
      const newItem = await agendaService.addAgendaItem(agendaId, itemText);
      setAgendas(prev => prev.map(agenda =>
        agenda.id === agendaId
          ? { ...agenda, agenda_items: [...(agenda.agenda_items || []), newItem] }
          : agenda
      ));
    } catch (error) {
      console.error('Error adding agenda item:', error.message || error);
      console.error('Full error object:', error);
    }
  };

  const deleteAgendaItem = async (itemId) => {
    try {
      await agendaService.deleteAgendaItem(itemId);
      setAgendas(prev => prev.map(agenda => ({
        ...agenda,
        agenda_items: agenda.agenda_items?.filter(item => item.id !== itemId) || []
      })));
    } catch (error) {
      console.error('Error deleting agenda item:', error);
    }
  };

  const updateAgendaItem = async (itemId, updates) => {
    try {
      const updatedItem = await agendaService.updateAgendaItem(itemId, updates);
      setAgendas(prev => prev.map(agenda => ({
        ...agenda,
        agenda_items: agenda.agenda_items?.map(item =>
          item.id === itemId ? updatedItem : item
        ) || []
      })));
    } catch (error) {
      console.error('Error updating agenda item:', error);
    }
  };

  const toggleAgendaCollapse = async (agendaId, isCollapsed) => {
    try {
      await agendaService.updateAgenda(agendaId, { is_collapsed: !isCollapsed });
      setAgendas(prev => prev.map(agenda =>
        agenda.id === agendaId ? { ...agenda, is_collapsed: !isCollapsed } : agenda
      ));
    } catch (error) {
      console.error('Error toggling agenda collapse:', error);
    }
  };

  const openFollowUpModal = (itemText) => {
    setFollowUpInitialText(itemText);
    setIsFollowUpModalOpen(true);
  };

  const createFollowUpFromAgenda = async (todoText, targetContext) => {
    try {
      const todoData = {
        text: todoText,
        tags: [],
        deadline: null
      };

      // Create the todo in the specified context
      const newTodo = await todoService.createTodo(user.id, targetContext, todoData);

      // If creating in current context, update local state
      if (targetContext === currentContext) {
        setTodos(prev => sortTodosWithDeadlines([...prev, newTodo]));
      }

      // Show success message or feedback
      console.log(`Follow-up todo created in ${targetContext} context`);
    } catch (error) {
      console.error('Error creating follow-up todo:', error);
    }
  };

  // Get current day of week (0 = Sunday, 1 = Monday, etc.) in ET timezone
  const getCurrentDayOfWeek = () => {
    const now = new Date();
    // Use Intl.DateTimeFormat to properly handle EST/EDT
    const etTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    return etTime.getDay();
  };

  // Get today's weekly tasks
  const getTodaysWeeklyTasks = () => {
    const today = getCurrentDayOfWeek();
    return weeklyTasks.filter(task => task.day_of_week === today);
  };

  // Deadline utility functions
  const getDeadlineUrgency = (deadline) => {
    if (!deadline) return 0; // Normal priority

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return 4; // Overdue - highest priority
    if (daysDiff <= 1) return 3; // Urgent (red) - high priority
    if (daysDiff <= 3) return 2; // Warning (orange) - medium-high priority
    if (daysDiff <= 7) return 1; // Caution (yellow) - medium priority
    return 0; // Normal priority
  };

  // Animation helper function for swapping
  const animateSwap = (movingId, targetId, direction) => {
    setSwappingAnimation({
      movingId,
      targetId,
      movingClass: `moving-${direction}`,
      targetClass: direction === 'up' ? 'target-down' : 'target-up'
    });

    setTimeout(() => {
      setSwappingAnimation(null);
    }, 400); // Match the CSS animation duration
  };

  // Sort todos with deadline-based pinning
  const sortTodosWithDeadlines = (todos) => {
    return [...todos].sort((a, b) => {
      const aUrgency = getDeadlineUrgency(a.deadline);
      const bUrgency = getDeadlineUrgency(b.deadline);

      // Pin urgent and warning items (orange/red) to top
      const aPinned = aUrgency >= 2; // Warning (orange) or higher
      const bPinned = bUrgency >= 2;

      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // Within pinned items, sort by urgency (most urgent first)
      if (aPinned && bPinned) {
        if (aUrgency !== bUrgency) return bUrgency - aUrgency;
      }

      // For same urgency level or non-pinned items, preserve sort_order
      if (a.sort_order !== null && b.sort_order !== null) {
        return a.sort_order - b.sort_order;
      }

      // Fallback to creation date
      return new Date(a.created_at) - new Date(b.created_at);
    });
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
        onOpenWeeklyTaskModal={() => setIsWeeklyTaskModalOpen(true)}
        currentContext={currentContext}
        onContextChange={handleContextChange}
      />

      <header className="App-header">
        {isLoading && (
          <div className="loading-indicator">
            <p>Loading your todos...</p>
          </div>
        )}

        {/* Weekly Tasks Section - Today's Tasks */}
        {getTodaysWeeklyTasks().length > 0 && (
          <div className="weekly-tasks-section">
            <div className="section-header">
              <div className="section-header-left">
                <h2>Today's Tasks ({getTodaysWeeklyTasks().length})</h2>
                <span className="weekly-tasks-indicator">
                  📅 {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][getCurrentDayOfWeek()]}
                </span>
              </div>
              <div className="section-header-right desktop-only">
                <button
                  className="manage-weekly-btn"
                  onClick={() => setIsWeeklyTaskModalOpen(true)}
                  title="Manage weekly tasks"
                >
                  Manage
                </button>
              </div>
            </div>
            <div className="weekly-tasks-list">
              {getTodaysWeeklyTasks().map((task) => (
                <WeeklyTaskItem
                  key={task.id}
                  task={task}
                  onMarkCompleted={markWeeklyTaskCompleted}
                  onMarkIncomplete={markWeeklyTaskIncomplete}
                />
              ))}
            </div>
          </div>
        )}


        {/* Main Content Area */}
        {currentContext === 'agendas' ? (
          // Agendas Page
          <div className="agendas-page">
            <div className="agendas-header">
              <div className="section-header">
                <div className="section-header-left">
                  <h2>Agendas</h2>
                  <span className="context-indicator context-agendas">
                    📋 Manage your meeting agendas and notes
                  </span>
                </div>
                <div className="section-header-right">
                  <button
                    className="desktop-add-btn"
                    onClick={() => {
                      const title = prompt('Enter agenda title:');
                      if (title && title.trim()) {
                        addAgenda({ title: title.trim() });
                      }
                    }}
                    title="Add new agenda"
                  >
                    Add Agenda
                  </button>
                </div>
              </div>
            </div>

            <div className="agendas-content">
              {agendas.length === 0 ? (
                <div className="no-agendas-message">
                  <h3>No agendas yet</h3>
                  <p>Create your first agenda to get started organizing your meetings and notes.</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const title = prompt('Enter agenda title:');
                      if (title && title.trim()) {
                        addAgenda({ title: title.trim() });
                      }
                    }}
                  >
                    Create First Agenda
                  </button>
                </div>
              ) : (
                <div className="agendas-list">
                  {agendas.map((agenda) => (
                    <div key={agenda.id} className="agenda-full-item">
                      <div className="agenda-full-header">
                        <div className="agenda-title-section">
                          <button
                            className="agenda-collapse-btn"
                            onClick={() => toggleAgendaCollapse(agenda.id, agenda.is_collapsed)}
                          >
                            {agenda.is_collapsed ? '▶' : '▼'}
                          </button>
                          <h3 className="agenda-full-title">{agenda.title}</h3>
                          <span className="agenda-item-count">
                            ({agenda.agenda_items?.length || 0} items)
                          </span>
                        </div>
                        <div className="agenda-full-actions">
                          <button
                            className="btn-secondary small"
                            onClick={() => {
                              const newTitle = prompt('Edit agenda title:', agenda.title);
                              if (newTitle && newTitle.trim() && newTitle !== agenda.title) {
                                updateAgenda(agenda.id, { title: newTitle.trim() });
                              }
                            }}
                          >
                            Edit Title
                          </button>
                          <button
                            className="btn-danger small"
                            onClick={() => {
                              if (window.confirm(`Delete agenda "${agenda.title}"?`)) {
                                deleteAgenda(agenda.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {!agenda.is_collapsed && (
                        <div className="agenda-full-content">
                          <div className="agenda-items-list">
                            {agenda.agenda_items?.map((item) => (
                              <div key={item.id} className="agenda-item-row">
                                <span className="agenda-bullet">•</span>
                                <span className="agenda-item-text">{item.text}</span>
                                <div className="agenda-item-actions">
                                  <button
                                    className="btn-followup"
                                    onClick={() => openFollowUpModal(item.text)}
                                    title="Create follow-up todo"
                                  >
                                    → Todo
                                  </button>
                                  <button
                                    className="btn-delete-item"
                                    onClick={() => {
                                      if (window.confirm('Delete this agenda item?')) {
                                        deleteAgendaItem(item.id);
                                      }
                                    }}
                                    title="Delete item"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}

                            <div className="add-agenda-item">
                              <input
                                type="text"
                                placeholder="Add new agenda item..."
                                className="add-item-input"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    addAgendaItem(agenda.id, e.target.value.trim());
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <button
                                className="btn-add-item"
                                onClick={(e) => {
                                  const input = e.target.previousElementSibling;
                                  if (input.value.trim()) {
                                    addAgendaItem(agenda.id, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Todo Sections (Work/Personal)
          <div className="todo-sections">
          <div className="todo-section">
            <div className="section-header">
              <div className="section-header-left">
                <h2>To Do ({todos.length})</h2>
                <span className={`context-indicator context-${currentContext}`}>
                  {currentContext === 'work' ? '💼' : '🏠'} {currentContext.charAt(0).toUpperCase() + currentContext.slice(1)}
                </span>
              </div>
              <div className="section-header-right desktop-only">
                <button
                  className="desktop-add-btn"
                  onClick={() => setIsAddModalOpen(true)}
                  title="Add new todo"
                >
                  Add
                </button>
              </div>
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
                  {todos.map((todo, index) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onMarkDone={markTodoDone}
                      onDelete={deleteTodo}
                      onEdit={handleEditTodo}
                      onWontDo={markTodoWontDo}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                      isDraggable={true}
                      canMoveUp={index > 0}
                      canMoveDown={index < todos.length - 1}
                      swappingState={swappingAnimation && (
                        todo.id === swappingAnimation.movingId ? swappingAnimation.movingClass :
                        todo.id === swappingAnimation.targetId ? swappingAnimation.targetClass : null
                      )}
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

          <div className="wont-do-section">
            <div
              className="collapsible-header"
              onClick={() => setIsWontDoSectionCollapsed(!isWontDoSectionCollapsed)}
            >
              <h2>Won't Do ({wontDoTodos.length})</h2>
              <span className="collapse-arrow">
                {isWontDoSectionCollapsed ? (
                  <ExpandMoreIcon sx={{ color: 'white', fontSize: 20 }} />
                ) : (
                  <ExpandLessIcon sx={{ color: 'white', fontSize: 20 }} />
                )}
              </span>
            </div>
            {!isWontDoSectionCollapsed && (
              <div className="wont-do-todo-list">
                {wontDoTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onMarkDone={markTodoWillDo}
                    onDelete={deleteTodo}
                    onEdit={handleEditTodo}
                    isDone={false}
                    isDraggable={false}
                  />
                ))}
                {wontDoTodos.length === 0 && (
                  <div className="no-done-todos">
                    No items marked as "won't do" yet
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
        )}
      </header>

      <TagModal
        isOpen={isTagModalOpen}
        onClose={() => setIsTagModalOpen(false)}
        tags={tags}
        onAddTag={addTag}
        onDeleteTag={deleteTag}
      />

      <WeeklyTaskModal
        isOpen={isWeeklyTaskModalOpen}
        onClose={() => setIsWeeklyTaskModalOpen(false)}
        weeklyTasks={weeklyTasks}
        onAddWeeklyTask={addWeeklyTask}
        onDeleteWeeklyTask={deleteWeeklyTask}
      />


      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTodo={addTodo}
        tags={tags}
      />

      <EditTodoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        todo={editTodo}
        tags={tags}
        onSave={saveTodoEdit}
      />

      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onCreateFollowUp={createFollowUpFromAgenda}
        initialText={followUpInitialText}
      />

      <FloatingAddButton onClick={() => setIsAddModalOpen(true)} />
    </div>
  );
}

export default App;