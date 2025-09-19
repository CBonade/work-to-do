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
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);
  const [tags, setTags] = useState([]);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedDoneTodos = localStorage.getItem('doneTodos');
    const savedTags = localStorage.getItem('tags');

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedDoneTodos) {
      setDoneTodos(JSON.parse(savedDoneTodos));
    }
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('doneTodos', JSON.stringify(doneTodos));
  }, [doneTodos]);

  useEffect(() => {
    localStorage.setItem('tags', JSON.stringify(tags));
  }, [tags]);

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
      setDoneTodos([...doneTodos, { ...todo, completed: true }]);
    }
  };

  const markTodoUndone = (id) => {
    const todo = doneTodos.find(t => t.id === id);
    if (todo) {
      setDoneTodos(doneTodos.filter(t => t.id !== id));
      setTodos([...todos, { ...todo, completed: false }]);
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

  return (
    <div className="App">
      <Navigation onOpenTagModal={() => setIsTagModalOpen(true)} />

      <header className="App-header">
        <AddTodo onAddTodo={addTodo} tags={tags} />

        <div className="todo-sections">
          <div className="todo-section">
            <h2>To Do ({todos.length})</h2>
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
            <h2>Done ({doneTodos.length})</h2>
            <div className="todo-list">
              {doneTodos.map((todo) => (
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
