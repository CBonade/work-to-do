import React from 'react';
import AddIcon from '@mui/icons-material/Add';

const FloatingAddButton = ({ onClick }) => {
  return (
    <button
      className="floating-add-button"
      onClick={onClick}
      title="Add new todo"
    >
      <AddIcon sx={{ color: 'white', fontSize: 24 }} />
    </button>
  );
};

export default FloatingAddButton;