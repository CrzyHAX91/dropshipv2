import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
} from '@material-ui/core';
import { Error as ErrorIcon } from '@material-ui/icons';

const styles = (theme) => ({
  root: {
    padding: theme.spacing(4),
    textAlign: 'center',
  },
  icon: {
    fontSize: 64,
    color: theme.palette.error.main,
    marginBottom: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  errorDetails: {
    marginTop: theme.spacing(2),
    textAlign: 'left',
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    fontFamily: 'monospace',
    overflow: 'auto',
    maxHeight: '200px',
  },
  actions: {
    marginTop: theme.spacing(3),
    '& > *': {
      margin: theme.spacing(1),
    },
  },
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    // Log the error to your error reporting service
    this.logError(error, errorInfo);
  }

  logError = (error, errorInfo) => {
    // TODO: Implement error logging service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  };

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { classes } = this.props;
    const { hasError, error, errorInfo } = this.state;

    if (!hasError) {
      return this.props.children;
    }

    return (
      <Container maxWidth="md">
        <Box className={classes.root}>
          <ErrorIcon className={classes.icon} />
          <Typography variant="h4" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </Typography>

          {(error || errorInfo) && (
            <Paper className={classes.paper} elevation={2}>
              {error && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Error Details
                  </Typography>
                  <pre className={classes.errorDetails}>
                    {error.toString()}
                  </pre>
                </>
              )}
              {errorInfo && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Component Stack
                  </Typography>
                  <pre className={classes.errorDetails}>
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </Paper>
          )}

          <div className={classes.actions}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReload}
            >
              Reload Page
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              href="/support"
            >
              Contact Support
            </Button>
          </div>
        </Box>
      </Container>
    );
  }
}

export default withStyles(styles)(ErrorBoundary);
