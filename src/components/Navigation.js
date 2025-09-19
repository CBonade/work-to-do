import React from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const Navigation = ({ onOpenTagModal }) => {
  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-brand">
          <h1>My To-Do App</h1>
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