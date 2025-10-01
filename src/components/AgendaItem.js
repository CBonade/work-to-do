import React from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import EditIcon from '@mui/icons-material/Edit';

const AgendaItem = ({
  agenda,
  onToggleCollapse,
  onCreateFollowUp,
  onOpenAgendaModal,
  currentContext
}) => {
  const handleToggleCollapse = () => {
    onToggleCollapse(agenda.id, agenda.is_collapsed);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="agenda-item-card">
      <div className="agenda-item-header" onClick={handleToggleCollapse}>
        <div className="agenda-item-title-section">
          <button className="agenda-collapse-btn">
            {agenda.is_collapsed ? (
              <ExpandMoreIcon sx={{ fontSize: 18, color: 'white' }} />
            ) : (
              <ExpandLessIcon sx={{ fontSize: 18, color: 'white' }} />
            )}
          </button>
          <h3 className="agenda-item-title">{agenda.title}</h3>
          <span className="agenda-item-count">
            ({agenda.agenda_items?.length || 0} items)
          </span>
        </div>

        <div className="agenda-item-actions">
          <span className="agenda-date">
            {formatDate(agenda.created_at)}
          </span>
          <button
            className="agenda-manage-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAgendaModal();
            }}
            title="Manage agendas"
          >
            <EditIcon sx={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      {!agenda.is_collapsed && (
        <div className="agenda-item-content">
          {agenda.agenda_items && agenda.agenda_items.length > 0 ? (
            <div className="agenda-bullet-points">
              {agenda.agenda_items.map((item) => (
                <div key={item.id} className="agenda-bullet-item">
                  <span className="bullet">•</span>
                  <span className="bullet-text">{item.text}</span>
                  <button
                    className="followup-btn"
                    onClick={() => onCreateFollowUp(item.text, currentContext)}
                    title="Create follow-up todo"
                  >
                    <PlaylistAddIcon sx={{ fontSize: 12 }} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-agenda-items">
              <p>No items in this agenda yet.</p>
              <button
                className="add-items-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAgendaModal();
                }}
              >
                Add Items
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AgendaItem;