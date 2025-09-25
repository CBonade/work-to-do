import React, { useState, useRef, useEffect } from 'react';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';

// Utility functions for deadline calculations
const getDeadlineStatus = (deadline) => {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const timeDiff = deadlineDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff < 0) return 'overdue';
  if (daysDiff <= 1) return 'urgent'; // Red - within 1 day
  if (daysDiff <= 3) return 'warning'; // Orange - within 3 days
  if (daysDiff <= 7) return 'caution'; // Yellow - within 1 week
  return 'normal';
};

const getDeadlineClass = (deadline) => {
  const status = getDeadlineStatus(deadline);
  switch (status) {
    case 'overdue': return 'deadline-overdue';
    case 'urgent': return 'deadline-urgent';
    case 'warning': return 'deadline-warning';
    case 'caution': return 'deadline-caution';
    default: return '';
  }
};

const TodoItem = ({
  todo,
  onMarkDone,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  isDone = false,
  isDraggable = false,
  canMoveUp = false,
  canMoveDown = false,
  swappingState = null
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const menuRef = useRef(null);

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

  const handleActionsMenuToggle = () => {
    setShowActionsMenu(!showActionsMenu);
  };

  const handleActionClick = (action) => {
    setShowActionsMenu(false);
    action();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showActionsMenu]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${isDone ? 'done' : ''} ${isDragging ? 'dragging' : ''} ${swappingState || ''} ${getDeadlineClass(todo.deadline)}`}
    >
      <div className="todo-content">
        {/* Desktop: Drag handle, Mobile: Reorder arrows */}
        {isDraggable && (
          <>
            <div className="drag-handle desktop-only" {...attributes} {...listeners}>
              <DragIndicatorIcon sx={{ color: 'white', fontSize: 18 }} />
            </div>
            <div className="mobile-reorder mobile-only">
              {canMoveUp && (
                <button
                  className="reorder-btn"
                  onClick={() => onMoveUp(todo.id)}
                  title="Move up"
                >
                  <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                </button>
              )}
              {canMoveDown && (
                <button
                  className="reorder-btn"
                  onClick={() => onMoveDown(todo.id)}
                  title="Move down"
                >
                  <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                </button>
              )}
            </div>
          </>
        )}

        <div className="todo-content-wrapper">
          <span className={`todo-text ${isDone ? 'strikethrough' : ''}`}>
            {renderTextWithLinks(todo.text)}
          </span>
          {isDone && todo.completed_date && (
            <div className="completion-date">
              Completed: {new Date(todo.completed_date).toLocaleDateString()}
            </div>
          )}
          {!isDone && todo.deadline && (
            <div className={`deadline-display ${getDeadlineClass(todo.deadline)}`}>
              Due: {new Date(todo.deadline).toLocaleDateString()}
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
        {/* Unified actions for all screen sizes */}
        <div className="unified-actions">
          {isDone ? (
            // Done items: Only undo button
            <button
              className="action-btn undo-btn"
              onClick={() => onMarkDone(todo.id)}
              title="Mark as undone"
            >
              <UndoIcon sx={{ color: 'white', fontSize: 16 }} />
            </button>
          ) : (
            // Active items: Done + menu
            <>
              <button
                className="action-btn done-btn"
                onClick={() => onMarkDone(todo.id)}
                title="Mark as done"
              >
                <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
              </button>
              <div className="actions-menu-container" ref={menuRef}>
                <button
                  className="action-btn menu-btn"
                  onClick={handleActionsMenuToggle}
                  title="More actions"
                >
                  {showActionsMenu ? (
                    <CloseIcon sx={{ color: 'white', fontSize: 16 }} />
                  ) : (
                    <MoreVertIcon sx={{ color: 'white', fontSize: 16 }} />
                  )}
                </button>
                {showActionsMenu && (
                  <div className="actions-dropdown">
                    <button
                      className="dropdown-action"
                      onClick={() => handleActionClick(() => onEdit(todo))}
                    >
                      <EditIcon sx={{ fontSize: 16, marginRight: 1 }} />
                      Edit
                    </button>
                    <button
                      className="dropdown-action delete-action"
                      onClick={() => handleActionClick(() => onDelete(todo.id))}
                    >
                      <DeleteIcon sx={{ fontSize: 16, marginRight: 1 }} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
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