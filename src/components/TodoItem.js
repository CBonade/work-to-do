import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

const TodoItem = ({ todo, onMarkDone, onDelete, isDone = false, isDraggable = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${isDone ? 'done' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="todo-content">
        {isDraggable && (
          <div className="drag-handle" {...attributes} {...listeners}>
            ⋮⋮
          </div>
        )}
        <span className={`todo-text ${isDone ? 'strikethrough' : ''}`}>
          {todo.text}
        </span>
      </div>
      <div className="todo-actions">
        <button
          className={`action-btn ${isDone ? 'undo-btn' : 'done-btn'}`}
          onClick={() => onMarkDone(todo.id)}
          title={isDone ? 'Mark as undone' : 'Mark as done'}
        >
          {isDone ? '↶' : '✓'}
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          title="Delete"
        >
          🗑
        </button>
      </div>
    </div>
  );
};

export default TodoItem;