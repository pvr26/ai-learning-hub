import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Box,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Chat as ChatIcon,
  GitHub as GitHubIcon,
  AccountCircle,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            AI Learning Hub
          </Typography>

          <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/search"
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/github"
              startIcon={<GitHubIcon />}
            >
              GitHub
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/ai-chat"
              startIcon={<ChatIcon />}
            >
              AI Chat
            </Button>
            {user && (
              <>
                <Button
                  component={RouterLink}
                  to="/submit"
                  color="inherit"
                  startIcon={<AddIcon />}
                  sx={{ mr: 2 }}
                >
                  Submit Resource
                </Button>
                <IconButton
                  component={RouterLink}
                  to="/bookmarks"
                  color="inherit"
                  sx={{ mr: 2 }}
                >
                  <BookmarkIcon />
                </IconButton>
              </>
            )}
            {user ? (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenu}
                  sx={{ ml: 1 }}
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={handleClose}
                  >
                    Profile
                  </MenuItem>
                  {user.is_admin && (
                    <MenuItem
                      component={RouterLink}
                      to="/admin"
                      onClick={handleClose}
                    >
                      Admin Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  color="inherit"
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 