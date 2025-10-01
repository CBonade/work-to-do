import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const FloatingAddButton = ({ onClick, icon = 'add', title = "Add new todo" }) => {
  const IconComponent = icon === 'edit' ? EditIcon : AddIcon;

  return (
    <button
      className="floating-add-button"
      onClick={onClick}
      title={title}
    >
      <IconComponent sx={{ color: 'white', fontSize: 24 }} />
    </button>
  );
};

export default FloatingAddButton;