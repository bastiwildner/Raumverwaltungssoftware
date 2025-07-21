import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SecondaryButton.css';

const SecondaryButton = ({ to, children, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button className={`secondary-button ${className}`} onClick={handleClick}>
      {children}
    </button>
  );
};

export default SecondaryButton;