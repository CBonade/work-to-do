import React from 'react';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';

const WeeklyTaskItem = ({ task, onMarkCompleted, onMarkIncomplete }) => {
  const handleToggleComplete = () => {
    if (task.completed_this_week) {
      onMarkIncomplete(task.id);
    } else {
      onMarkCompleted(task.id);
    }
  };

  return (
    <div className={`weekly-task-display ${task.completed_this_week ? 'completed' : ''}`}>
      <div className="weekly-task-content">
        <span className={`weekly-task-text ${task.completed_this_week ? 'strikethrough' : ''}`}>
          {task.text}
        </span>
      </div>
      <div className="weekly-task-actions">
        <button
          className="action-btn weekly-task-btn"
          onClick={handleToggleComplete}
          title={task.completed_this_week ? "Mark as incomplete" : "Mark as complete"}
        >
          {task.completed_this_week ? (
            <UndoIcon sx={{ color: 'white', fontSize: 16 }} />
          ) : (
            <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
          )}
        </button>
      </div>
    </div>
  );
};

export default WeeklyTaskItem;