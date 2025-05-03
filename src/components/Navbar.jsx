import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as UsersIcon,
  CreditCard as CreditCardIcon,
  BarChart as BarChartIcon,
  SyncAlt as SplitSquareVerticalIcon,
  Logout as LogOutIcon,
  ChevronLeft as ChevronLeftIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import Logo from '../assets/original.png';
import colors from '../styles/colors';

const Navbar = ({ isMinimized, setIsMinimized }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
  };

  const NavItem = ({ icon, title, path, isActive }) => (
    <ListItem
      component="button"
      onClick={() => navigate(path)}
      sx={{
        justifyContent: isMinimized ? 'center' : 'flex-start',
        p: '10px 16px',
        borderRadius: '12px',
        mb: '6px',
        bgcolor: isActive ? colors.primaryLight : 'transparent',
        '&:hover': {
          bgcolor: isActive ? colors.primaryLight : `${colors.primaryLight}50`,
        },
        transition: 'all 0.2s ease',
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: isMinimized ? 'auto' : '40px',
          color: isActive ? colors.primary : colors.textSecondary,
        }}
      >
        {icon}
      </ListItemIcon>
      {!isMinimized && (
        <ListItemText
          primary={title}
          sx={{
            color: isActive ? colors.primary : colors.text,
            '& .MuiTypography-root': {
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.95rem',
            },
          }}
        />
      )}
      {isActive && !isMinimized && (
        <Box
          sx={{
            width: '4px',
            height: '70%',
            position: 'absolute',
            right: '0',
            borderRadius: '4px 0 0 4px',
            bgcolor: colors.primary,
          }}
        />
      )}
    </ListItem>
  );

  const NavItems = () => (
    <>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMinimized ? 'center' : 'space-between',
          mb: 1,
        }}
      >
        {!isMinimized && (
          <Box
            component="img"
            src={Logo || '/placeholder.svg'}
            alt="SmartSave Logo"
            onClick={() => navigate('/dashboard')}
            sx={{
              width: 64,
              height: 48,
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.05)' },
            }}
          />
        )}
        {!isMobile && (
          <IconButton
            onClick={handleMinimizeToggle}
            sx={{
              color: colors.text,
              p: isMinimized ? 1 : 0,
              bgcolor: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              '&:hover': {
                bgcolor: colors.primaryLight,
              },
            }}
            size="small"
          >
            <ChevronLeftIcon
              sx={{
                transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
                fontSize: '1.25rem',
              }}
            />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ bgcolor: colors.border, mb: 2 }} />

      <Box sx={{ px: 2, mb: 3 }}>
        {!isMinimized && (
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              mb: 1,
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              display: 'block',
              pl: 1,
            }}
          >
            MAIN MENU
          </Typography>
        )}
        <List sx={{ mt: 1 }}>
          <NavItem
            icon={<HomeIcon />}
            title="Dashboard"
            path="/dashboard"
            isActive={location.pathname === '/dashboard'}
          />
          <NavItem
            icon={<UsersIcon />}
            title="Users"
            path="/users"
            isActive={
              location.pathname === '/users' ||
              location.pathname.includes('/user-details')
            }
          />
          <NavItem
            icon={<CreditCardIcon />}
            title="Transactions"
            path="/transactions"
            isActive={location.pathname === '/transactions'}
          />
          <NavItem
            icon={<BarChartIcon />}
            title="Analytics"
            path="/analytics"
            isActive={location.pathname === '/analytics'}
          />
          <NavItem
            icon={<SplitSquareVerticalIcon />}
            title="Bill Splitting"
            path="/bill-splitting"
            isActive={
              location.pathname === '/bill-splitting' ||
              location.pathname.includes('/group-details')
            }
          />
          <NavItem
            icon={<SendIcon />}
            title="Send Message"
            path="/send-message"
            isActive={location.pathname === '/send-message'}
          />
        </List>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          borderTop: `1px solid ${colors.border}`,
          bgcolor: colors.background,
        }}
      >
        <List>
          <NavItem
            icon={<LogOutIcon sx={{ color: colors.expense }} />}
            title="Logout"
            path="/"
            isActive={false}
          />
        </List>
      </Box>
    </>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={handleDrawerToggle}
          sx={{
            color: colors.text,
            m: 1.5,
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1300,
            bgcolor: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 2px 8px ${colors.shadow}`,
            '&:hover': {
              bgcolor: colors.primaryLight,
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            '& .MuiDrawer-paper': {
              width: 260,
              bgcolor: colors.background,
              color: colors.text,
              borderRight: `1px solid ${colors.border}`,
              boxShadow: `4px 0 12px ${colors.shadow}`,
            },
          }}
        >
          <NavItems />
        </Drawer>
      </>
    );
  }

  return (
    <Box
      sx={{
        width: isMinimized ? 72 : 260,
        height: '100vh',
        bgcolor: colors.background,
        borderRight: '1px solid',
        borderColor: colors.border,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        display: { xs: 'none', md: 'block' },
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        transition: 'width 0.3s ease',
        boxShadow: `2px 0 8px ${colors.shadow}`,
      }}
    >
      <NavItems />
    </Box>
  );
};

export default Navbar;