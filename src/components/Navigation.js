import React from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';

const Navigation = ({ onOpenTagModal, currentContext, onContextChange }) => {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-brand">
          <h1>My To-Do App</h1>
        </div>

        <div className="nav-center">
          <div className="context-tabs">
            <button
              className={`context-tab ${currentContext === 'work' ? 'active' : ''}`}
              onClick={() => onContextChange('work')}
              title="Work Tasks"
            >
              <WorkIcon sx={{ color: 'white', fontSize: 16, marginRight: 1 }} />
              Work
            </button>
            <button
              className={`context-tab ${currentContext === 'personal' ? 'active' : ''}`}
              onClick={() => onContextChange('personal')}
              title="Personal Tasks"
            >
              <HomeIcon sx={{ color: 'white', fontSize: 16, marginRight: 1 }} />
              Personal
            </button>
          </div>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <button
              className="nav-button"
              onClick={onOpenTagModal}
              title="Manage Tags"
            >
              <LocalOfferIcon sx={{ color: 'white', fontSize: 16, marginRight: 1 }} />
              Tags
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;