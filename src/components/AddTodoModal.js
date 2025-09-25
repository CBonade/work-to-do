import React, { useState } from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';

const AddTodoModal = ({ isOpen, onClose, onAddTodo, tags }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagSelector, setShowTagSelector] = useState(false);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTodo({
        text: inputValue.trim(),
        tags: selectedTags,
        deadline: deadline || null,
      });
      // Reset form and close modal
      setInputValue('');
      setSelectedTags([]);
      setShowTagSelector(false);
      setDeadline('');
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setInputValue('');
    setSelectedTags([]);
    setShowTagSelector(false);
    setDeadline('');
    onClose();
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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content add-todo-modal">
        <div className="modal-header">
          <h2>Add New Todo</h2>
          <button
            className="modal-close"
            onClick={handleClose}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="add-todo-container">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What needs to be done?"
                className="add-todo-input"
                autoFocus
              />

              <div className="deadline-input-container">
                <label htmlFor="deadline-input" className="deadline-label">
                  Deadline (optional):
                </label>
                <input
                  id="deadline-input"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="deadline-input"
                />
              </div>

              {tags.length > 0 && (
                <button
                  type="button"
                  className={`tag-toggle-btn ${showTagSelector ? 'active' : ''}`}
                  onClick={() => setShowTagSelector(!showTagSelector)}
                  title="Add tags"
                >
                  <LocalOfferIcon sx={{ color: 'white', fontSize: 16 }} />
                </button>
              )}
            </div>

            {showTagSelector && tags.length > 0 && (
              <div className="tag-selector-dropdown">
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
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="selected-tags-preview">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="tag-preview"
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

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Add Todo
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

export default AddTodoModal;