import React from 'react';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const TodoItem = ({ todo, onMarkDone, onDelete, onEdit, isDone = false, isDraggable = false }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${isDone ? 'done' : ''} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="todo-content">
        {isDraggable && (
          <div className="drag-handle" {...attributes} {...listeners}>
            <DragIndicatorIcon sx={{ color: 'white', fontSize: 18 }} />
          </div>
        )}
        <div className="todo-content-wrapper">
          <span className={`todo-text ${isDone ? 'strikethrough' : ''}`}>
            {renderTextWithLinks(todo.text)}
          </span>
          {isDone && todo.completedDate && (
            <div className="completion-date">
              Completed: {new Date(todo.completedDate).toLocaleDateString()}
            </div>
          )}
          {todo.tags && todo.tags.length > 0 && (
            <div className="todo-tags">
              {todo.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="todo-tag"
                  style={{
                    backgroundColor: tag.color,
                    color: getContrastColor(tag.color),
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="todo-actions">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(todo)}
          title="Edit"
        >
          <EditIcon sx={{ color: 'white', fontSize: 16 }} />
        </button>
        <button
          className={`action-btn ${isDone ? 'undo-btn' : 'done-btn'}`}
          onClick={() => onMarkDone(todo.id)}
          title={isDone ? 'Mark as undone' : 'Mark as done'}
        >
          {isDone ? (
            <UndoIcon sx={{ color: 'white', fontSize: 16 }} />
          ) : (
            <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
          )}
        </button>
        <button
          className="action-btn delete-btn"
          onClick={() => onDelete(todo.id)}
          title="Delete"
        >
          <DeleteIcon sx={{ color: 'white', fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};

// Helper function to determine text color based on background
function getContrastColor(hexColor) {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

export default TodoItem;