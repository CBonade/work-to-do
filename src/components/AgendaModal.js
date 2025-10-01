import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const AgendaModal = ({
  isOpen,
  onClose,
  agendas,
  onAddAgenda,
  onDeleteAgenda,
  onUpdateAgenda,
  onAddAgendaItem,
  onDeleteAgendaItem,
  onUpdateAgendaItem,
  onCreateFollowUp,
  currentContext
}) => {
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [editingAgenda, setEditingAgenda] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState({});
  const [localAgendas, setLocalAgendas] = useState([]);

  useEffect(() => {
    setLocalAgendas(agendas);
  }, [agendas]);

  const handleAddAgenda = async (e) => {
    e.preventDefault();
    if (newAgendaTitle.trim()) {
      await onAddAgenda({ title: newAgendaTitle.trim() });
      setNewAgendaTitle('');
    }
  };

  const handleToggleCollapse = async (agendaId, isCollapsed) => {
    // Update local state immediately for better UX
    setLocalAgendas(prev => prev.map(agenda =>
      agenda.id === agendaId ? { ...agenda, is_collapsed: !isCollapsed } : agenda
    ));

    // Update in database
    await onUpdateAgenda(agendaId, { is_collapsed: !isCollapsed });
  };

  const handleEditTitle = (agenda) => {
    setEditingAgenda(agenda.id);
    setEditingTitle(agenda.title);
  };

  const handleSaveTitle = async (agendaId) => {
    if (editingTitle.trim()) {
      await onUpdateAgenda(agendaId, { title: editingTitle.trim() });
      setEditingAgenda(null);
      setEditingTitle('');
    }
  };

  const handleCancelEdit = () => {
    setEditingAgenda(null);
    setEditingTitle('');
  };

  const handleAddItem = async (agendaId) => {
    const text = newItemTexts[agendaId];
    if (text && text.trim()) {
      await onAddAgendaItem(agendaId, text.trim());
      setNewItemTexts(prev => ({ ...prev, [agendaId]: '' }));
    }
  };

  const handleNewItemChange = (agendaId, value) => {
    setNewItemTexts(prev => ({ ...prev, [agendaId]: value }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content agenda-modal">
        <div className="modal-header">
          <h2>Manage Agendas - {currentContext.charAt(0).toUpperCase() + currentContext.slice(1)}</h2>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon sx={{ color: 'white', fontSize: 20 }} />
          </button>
        </div>

        <div className="modal-body agenda-modal-body">
          {/* Add New Agenda */}
          <form onSubmit={handleAddAgenda} className="add-agenda-form">
            <div className="form-group">
              <label htmlFor="newAgendaTitle">New Agenda Title</label>
              <div className="input-with-button">
                <input
                  id="newAgendaTitle"
                  type="text"
                  value={newAgendaTitle}
                  onChange={(e) => setNewAgendaTitle(e.target.value)}
                  placeholder="Enter agenda title..."
                  className="form-input"
                />
                <button type="submit" className="btn-primary add-btn">
                  <AddIcon sx={{ fontSize: 16 }} />
                  Add
                </button>
              </div>
            </div>
          </form>

          {/* Agenda List */}
          <div className="agendas-list">
            {localAgendas.length === 0 ? (
              <p className="no-agendas">No agendas yet. Create your first agenda above!</p>
            ) : (
              localAgendas.map((agenda) => (
                <div key={agenda.id} className="agenda-card">
                  {/* Agenda Header */}
                  <div className="agenda-header">
                    <div className="agenda-title-section">
                      <button
                        className="collapse-btn"
                        onClick={() => handleToggleCollapse(agenda.id, agenda.is_collapsed)}
                      >
                        {agenda.is_collapsed ? (
                          <ExpandMoreIcon sx={{ fontSize: 16 }} />
                        ) : (
                          <ExpandLessIcon sx={{ fontSize: 16 }} />
                        )}
                      </button>

                      {editingAgenda === agenda.id ? (
                        <div className="edit-title-section">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="edit-title-input"
                            autoFocus
                          />
                          <button
                            className="save-title-btn"
                            onClick={() => handleSaveTitle(agenda.id)}
                          >
                            <SaveIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button
                            className="cancel-edit-btn"
                            onClick={handleCancelEdit}
                          >
                            <CancelIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                      ) : (
                        <div className="title-display">
                          <h3 className="agenda-title">{agenda.title}</h3>
                          <span className="agenda-item-count">
                            ({agenda.agenda_items?.length || 0} items)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="agenda-actions">
                      {editingAgenda !== agenda.id && (
                        <>
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEditTitle(agenda)}
                            title="Edit title"
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => onDeleteAgenda(agenda.id)}
                            title="Delete agenda"
                          >
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Agenda Content (when expanded) */}
                  {!agenda.is_collapsed && (
                    <div className="agenda-content">
                      {/* Agenda Items */}
                      <div className="agenda-items">
                        {agenda.agenda_items?.map((item, index) => (
                          <div key={item.id} className="agenda-item">
                            <span className="bullet-point">•</span>
                            <span className="item-text">{item.text}</span>
                            <div className="item-actions">
                              <button
                                className="create-followup-btn"
                                onClick={() => onCreateFollowUp(item.text, currentContext)}
                                title="Create follow-up todo"
                              >
                                <PlaylistAddIcon sx={{ fontSize: 14 }} />
                              </button>
                              <button
                                className="delete-item-btn"
                                onClick={() => onDeleteAgendaItem(item.id)}
                                title="Delete item"
                              >
                                <DeleteIcon sx={{ fontSize: 12 }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add New Item */}
                      <div className="add-item-section">
                        <div className="input-with-button">
                          <input
                            type="text"
                            value={newItemTexts[agenda.id] || ''}
                            onChange={(e) => handleNewItemChange(agenda.id, e.target.value)}
                            placeholder="Add bullet point..."
                            className="add-item-input"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddItem(agenda.id);
                              }
                            }}
                          />
                          <button
                            className="add-item-btn"
                            onClick={() => handleAddItem(agenda.id)}
                            disabled={!newItemTexts[agenda.id]?.trim()}
                          >
                            <AddIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgendaModal;