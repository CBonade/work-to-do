import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import GitHubIcon from '@mui/icons-material/GitHub';

const LoginPage = () => {
  const { signInWithGitHub } = useAuth();

  const handleGitHubLogin = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="app-logo">
            <span className="logo-icon">🎯</span>
            <h1>Odd Jobs</h1>
          </div>
          <p>Organize your work and personal tasks with Oddball's task manager</p>
        </div>

        <div className="login-content">
          <h2>Welcome to Odd Jobs!</h2>
          <p>Sign in with your GitHub account to access your tasks from anywhere.</p>

          <div className="login-features">
            <div className="feature">
              <span className="feature-icon">💼</span>
              <span>Separate work and personal tasks</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🏷️</span>
              <span>Organize with custom tags</span>
            </div>
            <div className="feature">
              <span className="feature-icon">☁️</span>
              <span>Sync across all your devices</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>Your data is private and secure</span>
            </div>
          </div>

          <button className="github-login-btn" onClick={handleGitHubLogin}>
            <GitHubIcon sx={{ marginRight: 1 }} />
            Sign in with GitHub
          </button>

          <div className="login-footer">
            <p>
              Your todos will be stored securely and only accessible by you.
              <br />
              We use GitHub authentication for secure, passwordless access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;