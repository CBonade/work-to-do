import React from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ onOpenTagModal, currentContext, onContextChange }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  return (
    <nav className="navigation">
      <div className="nav-content">
        <div className="nav-brand">
          <div className="nav-logo">
            <span className="nav-logo-icon">🎯</span>
            <h1>Odd Jobs</h1>
          </div>
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
          {user && (
            <li className="nav-item">
              <div className="user-info">
                <img
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  className="user-avatar"
                />
                <span className="user-name">{user.user_metadata?.full_name || user.email}</span>
              </div>
            </li>
          )}
          <li className="nav-item">
            <button
              className="nav-button"
              onClick={handleSignOut}
              title="Sign Out"
            >
              <LogoutIcon sx={{ color: 'white', fontSize: 16, marginRight: 1 }} />
              Sign Out
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;