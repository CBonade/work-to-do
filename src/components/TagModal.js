import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

const TagModal = ({ isOpen, onClose, tags, onAddTag, onDeleteTag }) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#007acc');

  const presetColors = [
    '#007acc', // Blue (default)
    '#28a745', // Green
    '#dc3545', // Red
    '#ffc107', // Yellow
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#e83e8c', // Pink
    '#6c757d', // Gray
    '#17a2b8', // Cyan
    '#343a40', // Dark
    '#f8f9fa', // Light
    '#495057', // Dark Gray
    '#007bff', // Primary Blue
    '#6610f2', // Indigo
    '#e91e63', // Deep Pink
    '#ff9800', // Amber
    '#795548', // Brown
    '#607d8b', // Blue Gray
    '#9c27b0', // Deep Purple
    '#3f51b5', // Indigo Blue
    '#2196f3', // Light Blue
    '#00bcd4', // Cyan Blue
    '#009688', // Teal Green
    '#4caf50', // Light Green
    '#8bc34a', // Lime
    '#cddc39', // Lime Yellow
    '#ffeb3b', // Yellow Bright
    '#ff5722', // Deep Orange
    '#9e9e9e'  // Medium Gray
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTagName.trim()) {
      onAddTag({
        id: Date.now().toString(),
        name: newTagName.trim(),
        color: newTagColor,
      });
      setNewTagName('');
      setNewTagColor('#007acc');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Tags</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon sx={{ color: 'white', fontSize: 20 }} />
          </button>
        </div>

        <div className="modal-body">
          <form className="tag-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tagName">Tag Name</label>
              <input
                id="tagName"
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="tagColor">Tag Color</label>
              <div className="color-picker-grid">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${newTagColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewTagColor(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Add Tag
            </button>
          </form>

          <div className="existing-tags">
            <h3>Existing Tags</h3>
            {tags.length === 0 ? (
              <p className="no-tags">No tags created yet</p>
            ) : (
              <div className="tag-list">
                {tags.map((tag) => (
                  <div key={tag.id} className="tag-item">
                    <span
                      className="tag-preview"
                      style={{
                        backgroundColor: tag.color,
                        color: getContrastColor(tag.color),
                      }}
                    >
                      {tag.name}
                    </span>
                    <button
                      className="tag-delete"
                      onClick={() => onDeleteTag(tag.id)}
                      title="Delete tag"
                    >
                      <DeleteIcon sx={{ color: '#ff6b6b', fontSize: 16 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
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

export default TagModal;