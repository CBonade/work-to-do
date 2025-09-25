import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const WeeklyTaskModal = ({ isOpen, onClose, weeklyTasks, onAddWeeklyTask, onDeleteWeeklyTask }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(1); // Default to Monday
  const [editingTask, setEditingTask] = useState(null);

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddWeeklyTask({
        text: inputValue.trim(),
        dayOfWeek: selectedDayOfWeek,
      });
      // Reset form
      setInputValue('');
      setSelectedDayOfWeek(1);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setInputValue('');
    setSelectedDayOfWeek(1);
    setEditingTask(null);
    onClose();
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this weekly task?')) {
      onDeleteWeeklyTask(taskId);
    }
  };

  const getDayName = (dayOfWeek) => {
    return daysOfWeek.find(day => day.value === dayOfWeek)?.label || 'Unknown';
  };

  // Group tasks by day of week
  const groupedTasks = weeklyTasks.reduce((groups, task) => {
    const day = task.day_of_week;
    if (!groups[day]) {
      groups[day] = [];
    }
    groups[day].push(task);
    return groups;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content weekly-task-modal">
        <div className="modal-header">
          <h2>Day of the Week Tasks</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="weekly-task-form">
            <div className="form-group">
              <label htmlFor="task-text">Task Description</label>
              <input
                id="task-text"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g., Take out trash, Water plants"
                className="weekly-task-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="day-select">Day of Week</label>
              <select
                id="day-select"
                value={selectedDayOfWeek}
                onChange={(e) => setSelectedDayOfWeek(parseInt(e.target.value))}
                className="day-select"
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary add-weekly-task-btn">
              Add Weekly Task
            </button>
          </form>

          <div className="weekly-tasks-list">
            <h3>Current Weekly Tasks</h3>
            {Object.keys(groupedTasks).length === 0 ? (
              <p className="no-tasks">No weekly tasks yet. Add one above!</p>
            ) : (
              <div className="weekly-tasks-by-day">
                {daysOfWeek.map((day) => {
                  const tasksForDay = groupedTasks[day.value] || [];
                  if (tasksForDay.length === 0) return null;

                  return (
                    <div key={day.value} className="day-group">
                      <h4 className="day-header">{day.label}</h4>
                      <div className="day-tasks">
                        {tasksForDay.map((task) => (
                          <div key={task.id} className="weekly-task-item">
                            <span className="task-text">{task.text}</span>
                            <div className="task-actions">
                              <button
                                className="task-action-btn delete-btn"
                                onClick={() => handleDelete(task.id)}
                                title="Delete task"
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTaskModal;