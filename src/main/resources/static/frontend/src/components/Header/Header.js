import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import Image1Image from './assets/images/Uni_Passau-Logo.png';
import SecondaryButton from '../SecondaryButton/SecondaryButton';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { Link } from 'react-router-dom';

const HeaderV25Default1 = styled("div")({
  backgroundColor: `rgba(62, 14, 14, 0.2)`,
  boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
  position: 'relative',
  zIndex: 1000,
});

const HeaderTop = styled("div")(({ theme }) => ({
  backgroundColor: `rgba(241, 243, 247, 1)`,
  display: `flex`,
  justifyContent: `space-between`,
  alignItems: `center`,
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3, 10),
  },
}));

const Image1 = styled("img")(({ theme }) => ({
  height: '40px',
  [theme.breakpoints.up('md')]: {
    height: '46px',
    width: '165px'
  },
}));

const ButtonRow = styled("div")(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: '16px',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const MobileMenu = styled("div")(({ theme, open }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: `rgba(225, 228, 237, 1)`,
  padding: theme.spacing(2),
  display: open ? 'flex' : 'none',
  flexDirection: 'column',
  gap: theme.spacing(2),
  zIndex: 1000,
  [theme.breakpoints.up('md')]: {
    display: 'none !important'
  },
}));

const MenuButton = styled("button")(({ theme }) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(109, 117, 143, 0.7)',
  fontSize: '24px',
  padding: '8px',
  display: 'block',
  [theme.breakpoints.up('md')]: {
    display: 'none'
  },
}));

const HeaderBottom = styled("div")(({ theme }) => ({
  backgroundColor: `rgba(225, 228, 237, 1)`,
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '72px',
    padding: theme.spacing(0, 10)
  },
}));

const MobileLink = styled(Link)(({ theme }) => ({
  color: 'rgba(109, 117, 143, 0.7)',
  textDecoration: 'none',
  padding: '8px 12px',
  width: '100%',
  textAlign: 'center',
}));

function HeaderV25Default() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <HeaderV25Default1>
      <HeaderTop>
        <Image1 src={Image1Image} alt="Uni Passau Logo" />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ButtonRow>
            <SecondaryButton to="/login">Login</SecondaryButton>
            <PrimaryButton to="/register">Registrierung</PrimaryButton>
          </ButtonRow>
          
          <MenuButton onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </MenuButton>
        </div>
      </HeaderTop>

      <MobileMenu open={mobileOpen}>
        <MobileLink to="/login" onClick={() => setMobileOpen(false)}>
          Login
        </MobileLink>
        <MobileLink to="/register" onClick={() => setMobileOpen(false)}>
          Registrierung
        </MobileLink>
      </MobileMenu>
    </HeaderV25Default1>
  );
}

export default HeaderV25Default;