import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PrimaryButton.css';

const PrimaryButton = ({ to, children, className }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button className={`primary-button ${className}`} onClick={handleClick}>
      {children}
    </button>
  );
};

export default PrimaryButton;