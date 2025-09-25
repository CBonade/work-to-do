import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const EditTodoModal = ({ isOpen, onClose, todo, tags, onSave }) => {
  const [todoText, setTodoText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (todo) {
      setTodoText(todo.text || '');
      setSelectedTags(todo.tags || []);
      setDeadline(todo.deadline || '');
    }
  }, [todo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (todoText.trim()) {
      onSave({
        ...todo,
        text: todoText.trim(),
        deadline: deadline || null,
        tags: selectedTags,
      });
      onClose();
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !todo) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Todo</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon sx={{ color: 'white', fontSize: 20 }} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="todoText">Todo Text</label>
              <input
                id="todoText"
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder="Enter todo text..."
                className="form-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadlineEdit">Deadline (optional)</label>
              <input
                id="deadlineEdit"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="deadline-input"
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tag-selector">
                {tags.length === 0 ? (
                  <p className="no-tags">No tags available. Create some tags first!</p>
                ) : (
                  <div className="tag-options">
                    {tags.map((tag) => (
                      <label key={tag.id} className="tag-option">
                        <input
                          type="checkbox"
                          checked={selectedTags.some(t => t.id === tag.id)}
                          onChange={() => handleTagToggle(tag)}
                        />
                        <span
                          className="tag-checkbox"
                          style={{
                            backgroundColor: selectedTags.some(t => t.id === tag.id) ? tag.color : 'transparent',
                            borderColor: tag.color,
                            color: selectedTags.some(t => t.id === tag.id) ? getContrastColor(tag.color) : tag.color,
                          }}
                        >
                          {tag.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
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

export default EditTodoModal;