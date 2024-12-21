import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@material-ui/core';
import {
  Notifications as NotificationsIcon,
  AccountCircle,
  Dashboard as DashboardIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    textDecoration: 'none',
    color: 'inherit',
  },
  navLink: {
    marginLeft: theme.spacing(2),
    color: 'inherit',
    textDecoration: 'none',
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function Header() {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotifications = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setNotificationsAnchor(null);
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar className={classes.toolbar}>
          <div className={classes.leftSection}>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              className={classes.title}
            >
              Dropship Platform
            </Typography>
            <Button
              color="inherit"
              component={RouterLink}
              to="/dashboard"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            <Button color="inherit" component={RouterLink} to="/products">
              Products
            </Button>
            <Button color="inherit" component={RouterLink} to="/analytics">
              Analytics
            </Button>
          </div>
          
          <div className={classes.rightSection}>
            <IconButton color="inherit" onClick={handleNotifications}>
              <Badge badgeContent={4} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </div>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
              Profile
            </MenuItem>
            <MenuItem component={RouterLink} to="/settings" onClick={handleClose}>
              Settings
            </MenuItem>
            <MenuItem onClick={handleClose}>Logout</MenuItem>
          </Menu>

          <Menu
            id="notifications-menu"
            anchorEl={notificationsAnchor}
            keepMounted
            open={Boolean(notificationsAnchor)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>New Order #1234</MenuItem>
            <MenuItem onClick={handleClose}>Low Stock Alert</MenuItem>
            <MenuItem onClick={handleClose}>Price Update</MenuItem>
            <MenuItem onClick={handleClose}>System Update</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;
