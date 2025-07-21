import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Image1Image from './assets/images/Uni_Passau-Logo.png';
import { Link } from 'react-router-dom';
import PrimaryButton from '../PrimaryButton/PrimaryButton';
import { fetchUserByToken } from '../../services/UserService';

const HeaderContainer = styled("div")(({ theme }) => ({
  backgroundColor: `rgba(62, 14, 14, 0.2)`,
  boxShadow: `0px 4px 4px rgba(0, 0, 0, 0.25)`,
  position: 'relative',
  zIndex: 1000,
}));

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

const Logo = styled("img")(({ theme }) => ({
  height: '40px',
  [theme.breakpoints.up('md')]: {
    height: '46px',
    width: '165px'
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

const NavLinks = styled("div")(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  alignItems: 'center',
}));

const NavLink = styled(Link)(({ theme }) => ({
  color: 'rgba(109, 117, 143, 0.7)',
  textDecoration: 'none',
  fontSize: '16px',
  fontWeight: 500,
  transition: 'color 0.3s ease',
  padding: '8px 12px',
  borderRadius: '4px',
  '&:hover': {
    color: 'rgba(109, 117, 143, 1)',
    backgroundColor: 'rgba(241, 243, 247, 0.5)'
  }
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

const DesktopDropdown = styled("div")(({ theme }) => ({
  position: 'relative',
  '&:hover > div': {
    display: 'flex',
  },
}));

const DesktopDropdownContent = styled("div")(({ theme }) => ({
  display: 'none',
  position: 'absolute',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  minWidth: '160px',
  boxShadow: '0px 8px 16px rgba(0,0,0,0.2)',
  padding: '8px',
  top: '100%',
  left: 0,
  flexDirection: 'column',
  gap: '8px',
  zIndex: 1001,
}));

const DropdownButton = styled(NavLink)(({ theme }) => ({
  cursor: 'pointer',
  '&:after': {
    content: '"▼"',
    fontSize: '0.6em',
    marginLeft: '6px',
    verticalAlign: 'middle'
  }
}));

const MenuButton = styled("button")(({ theme }) => ({
  display: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'rgba(109, 117, 143, 0.7)',
  fontSize: '24px',
  lineHeight: 1,
  padding: '8px',
  [theme.breakpoints.down('md')]: {
    display: 'block'
  }
}));

function HeaderLoggedIn() {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const userData = await fetchUserByToken();
      setUser(userData);
    };
    getUser();
  }, []);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <HeaderContainer>
      <HeaderTop>
        <Logo src={Image1Image} alt="Uni Passau Logo" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <PrimaryButton to="/nutzer/1">Konto</PrimaryButton>
          <MenuButton onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
          </MenuButton>
        </div>
      </HeaderTop>

      {/* Desktop Navigation */}
      <HeaderBottom>
        <NavLinks>
          <NavLink to="/home">Startseite</NavLink>
          <NavLink to="/raumuebersicht">Raumübersicht</NavLink>
          <NavLink to="/gebäudeübersicht">Gebäudeübersicht</NavLink>
          
          <DesktopDropdown>
            <DropdownButton to="#">Sonstiges</DropdownButton>
            <DesktopDropdownContent>
              {(user?.rolle?.name === 'Verwaltungsmitarbeitende'|| user?.rolle?.name === 'Admin') && (
                <NavLink to="/dashboardVM">Statistiken</NavLink>
              )}
              <NavLink to="/Meinebuchungen">Meine Buchungen</NavLink>
              {(user?.rolle?.name === 'Verwaltungsmitarbeitende'|| user?.rolle?.name === 'Admin') && (
                <NavLink to="/Buchungsuebersicht">Buchungsübersicht</NavLink>
              )}
              {user?.rolle?.name === 'Facility Manager' && (
                <NavLink to="/ticketuebersicht">Service Tickets</NavLink>
              )}

              {user?.rolle?.name === 'Admin' && (
                <>
                  <NavLink to="/Nutzerübersicht">Benutzerverwaltung</NavLink>
                  <NavLink to="/logbuch">Logbuch</NavLink>
                  <NavLink to="/BackupVerwalten">Backups</NavLink>
                </>
              )}
            </DesktopDropdownContent>
          </DesktopDropdown>
        </NavLinks>
      </HeaderBottom>

      {/* Mobile Navigation */}
      <MobileMenu open={mobileOpen}>
        <NavLink to="/home" onClick={closeMobileMenu}>Startseite</NavLink>
        <NavLink to="/raumuebersicht" onClick={closeMobileMenu}>Raumübersicht</NavLink>
        <NavLink to="/gebäudeübersicht" onClick={closeMobileMenu}>Gebäudeübersicht</NavLink>
        <div style={{ height: '1px', backgroundColor: '#ccc', margin: '8px 0' }} />

        <NavLink to="/Meinebuchungen" onClick={closeMobileMenu}>Meine Buchungen</NavLink>
        {(user?.rolle?.name === 'Facility Manager'|| 'Admin') && (
          <NavLink to="/Buchungsuebersicht" onClick={closeMobileMenu}>Buchungsübersicht</NavLink>
        )}
        {user?.rolle?.name === 'Facility Manager' && (
          <NavLink to="/ticketuebersicht" onClick={closeMobileMenu}>Service Tickets</NavLink>
        )}
        {user?.rolle?.name === 'Verwaltungsmitarbeitende' && (
          <NavLink to="/dashboardVM" onClick={closeMobileMenu}>Statistiken</NavLink>
        )}
        {user?.rolle?.name === 'Admin' && (
          <>
            <NavLink to="/Nutzerübersicht" onClick={closeMobileMenu}>Benutzerverwaltung</NavLink>
            <NavLink to="/logbuch" onClick={closeMobileMenu}>Logbuch</NavLink>
            <NavLink to="/BackupVerwalten" onClick={closeMobileMenu}>Backups</NavLink>
          </>
        )}
      </MobileMenu>
    </HeaderContainer>
  );
}

export default HeaderLoggedIn;