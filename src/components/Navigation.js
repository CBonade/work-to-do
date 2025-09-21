import React, { useState } from 'react';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import WorkIcon from '@mui/icons-material/Work';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../contexts/AuthContext';

const Navigation = ({ onOpenTagModal, currentContext, onContextChange }) => {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navigation">
      <div className="nav-content">
        {/* Left: Hamburger Menu (Mobile) + Logo */}
        <div className="nav-left">
          <button
            className="hamburger-button"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ?
              <CloseIcon sx={{ color: 'white', fontSize: 20 }} /> :
              <MenuIcon sx={{ color: 'white', fontSize: 20 }} />
            }
          </button>

          <div className="nav-brand">
            <div className="nav-logo">
              <span className="nav-logo-icon">🎯</span>
              <h1>Odd Jobs</h1>
            </div>
          </div>
        </div>

        {/* Center: Context Tabs */}
        <div className="nav-center">
          <div className="context-tabs">
            <button
              className={`context-tab ${currentContext === 'work' ? 'active' : ''}`}
              onClick={() => onContextChange('work')}
              title="Work Tasks"
            >
              <WorkIcon sx={{ color: 'white', fontSize: 16 }} />
              <span className="tab-text">Work</span>
            </button>
            <button
              className={`context-tab ${currentContext === 'personal' ? 'active' : ''}`}
              onClick={() => onContextChange('personal')}
              title="Personal Tasks"
            >
              <HomeIcon sx={{ color: 'white', fontSize: 16 }} />
              <span className="tab-text">Personal</span>
            </button>
          </div>
        </div>

        {/* Right: User Menu */}
        <div className="nav-right">
          {user && (
            <div className="user-menu-container">
              <button
                className="user-menu-button"
                onClick={toggleUserMenu}
                aria-label="User menu"
              >
                <img
                  src={user.user_metadata?.avatar_url}
                  alt={user.user_metadata?.full_name || 'User'}
                  className="user-avatar"
                />
                <span className="user-name">{user.user_metadata?.full_name || user.email}</span>
                <ExpandMoreIcon sx={{ color: 'white', fontSize: 16, marginLeft: 0.5 }} />
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <img
                      src={user.user_metadata?.avatar_url}
                      alt={user.user_metadata?.full_name || 'User'}
                      className="dropdown-avatar"
                    />
                    <div className="user-details">
                      <div className="user-display-name">{user.user_metadata?.full_name || 'User'}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <button
                    className="dropdown-item"
                    onClick={handleSignOut}
                  >
                    <LogoutIcon sx={{ fontSize: 16, marginRight: 1 }} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger Menu Overlay */}
        {isMenuOpen && (
          <>
            <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />
            <div className="hamburger-menu">
              <div className="menu-header">
                <h3>Menu</h3>
                <button
                  className="menu-close"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <CloseIcon sx={{ fontSize: 20 }} />
                </button>
              </div>
              <div className="menu-items">
                <button
                  className="menu-item"
                  onClick={() => {
                    onOpenTagModal();
                    handleMenuItemClick();
                  }}
                >
                  <LocalOfferIcon sx={{ fontSize: 20, marginRight: 2 }} />
                  Manage Tags
                </button>
                {/* Future menu items can be added here */}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;