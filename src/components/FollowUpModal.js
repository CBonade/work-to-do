import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

const FollowUpModal = ({ isOpen, onClose, onCreateFollowUp, initialText = '' }) => {
  const [todoText, setTodoText] = useState('');
  const [targetContext, setTargetContext] = useState('work');

  useEffect(() => {
    if (isOpen) {
      setTodoText(initialText);
      setTargetContext('work');
    }
  }, [isOpen, initialText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (todoText.trim()) {
      onCreateFollowUp(todoText.trim(), targetContext);
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content followup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Follow-Up Todo</h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit} className="followup-form">
            <div className="form-group">
              <label htmlFor="todoText">Todo Description:</label>
              <textarea
                id="todoText"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your follow-up todo..."
                className="todo-input"
                rows="3"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Add to list:</label>
              <div className="context-selection">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="context"
                    value="work"
                    checked={targetContext === 'work'}
                    onChange={(e) => setTargetContext(e.target.value)}
                  />
                  <span className="radio-label">Work</span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="context"
                    value="personal"
                    checked={targetContext === 'personal'}
                    onChange={(e) => setTargetContext(e.target.value)}
                  />
                  <span className="radio-label">Personal</span>
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!todoText.trim()}
              >
                Add Todo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FollowUpModal;