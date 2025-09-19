import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

const TagModal = ({ isOpen, onClose, tags, onAddTag, onDeleteTag }) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#007acc');

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
              <input
                id="tagColor"
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="form-color"
              />
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