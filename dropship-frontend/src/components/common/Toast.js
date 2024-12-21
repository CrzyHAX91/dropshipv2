import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Snackbar, IconButton } from '@material-ui/core';
import { Alert as MuiAlert } from '@material-ui/lab';
import { Close as CloseIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  success: {
    backgroundColor: theme.palette.success.main,
  },
  error: {
    backgroundColor: theme.palette.error.main,
  },
  info: {
    backgroundColor: theme.palette.info.main,
  },
  warning: {
    backgroundColor: theme.palette.warning.main,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Toast({
  open,
  message,
  severity = 'info',
  duration = 6000,
  onClose,
  action,
  position = {
    vertical: 'bottom',
    horizontal: 'left',
  },
}) {
  const classes = useStyles();

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const defaultAction = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Snackbar
      anchorOrigin={position}
      open={open}
      autoHideDuration={duration}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        action={action || defaultAction}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}

// Toast Context for global usage
export const ToastContext = React.createContext({
  showToast: () => {},
  hideToast: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = React.useState({
    open: false,
    message: '',
    severity: 'info',
    duration: 6000,
  });

  const showToast = ({
    message,
    severity = 'info',
    duration = 6000,
    position,
  }) => {
    setToast({
      open: true,
      message,
      severity,
      duration,
      position,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        duration={toast.duration}
        position={toast.position}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

// Custom hook for using toast
export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Helper functions for common toast types
Toast.success = (message, options = {}) => {
  return { message, severity: 'success', ...options };
};

Toast.error = (message, options = {}) => {
  return { message, severity: 'error', ...options };
};

Toast.info = (message, options = {}) => {
  return { message, severity: 'info', ...options };
};

Toast.warning = (message, options = {}) => {
  return { message, severity: 'warning', ...options };
};

export default Toast;
