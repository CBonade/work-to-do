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
import TodoItem from './components/TodoItem';
import AddTodo from './components/AddTodo';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedDoneTodos = localStorage.getItem('doneTodos');

    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
    if (savedDoneTodos) {
      setDoneTodos(JSON.parse(savedDoneTodos));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('doneTodos', JSON.stringify(doneTodos));
  }, [doneTodos]);

  const addTodo = (text) => {
    const newTodo = {
      id: Date.now().toString(),
      text: text.trim(),
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>My To-Do App</h1>
        <AddTodo onAddTodo={addTodo} />

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
                  isDone={true}
                  isDraggable={false}
                />
              ))}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
