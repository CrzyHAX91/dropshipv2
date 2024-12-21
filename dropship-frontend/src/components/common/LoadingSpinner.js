import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CircularProgress, Typography, Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    padding: theme.spacing(3),
  },
  progress: {
    marginBottom: theme.spacing(2),
  },
  message: {
    color: theme.palette.text.secondary,
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal + 1,
  },
}));

function LoadingSpinner({
  size = 40,
  message = 'Loading...',
  fullScreen = false,
  color = 'primary',
}) {
  const classes = useStyles();

  const content = (
    <Box className={classes.root}>
      <CircularProgress
        size={size}
        color={color}
        className={classes.progress}
      />
      {message && (
        <Typography variant="body1" className={classes.message}>
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return <div className={classes.overlay}>{content}</div>;
  }

  return content;
}

// Loading states for different scenarios
LoadingSpinner.Page = () => (
  <LoadingSpinner
    size={60}
    message="Loading page content..."
    fullScreen={true}
  />
);

LoadingSpinner.Data = () => (
  <LoadingSpinner
    size={40}
    message="Fetching data..."
  />
);

LoadingSpinner.Submit = () => (
  <LoadingSpinner
    size={30}
    message="Processing..."
    color="secondary"
  />
);

LoadingSpinner.Overlay = ({ message }) => (
  <LoadingSpinner
    size={50}
    message={message}
    fullScreen={true}
  />
);

LoadingSpinner.Inline = () => (
  <CircularProgress size={20} />
);

export default LoadingSpinner;
