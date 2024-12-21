import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import { Close as CloseIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiDialog-paper': {
      minWidth: '300px',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  title: {
    margin: 0,
    padding: theme.spacing(1, 0),
  },
  content: {
    padding: theme.spacing(2),
    '&:first-child': {
      paddingTop: theme.spacing(2),
    },
  },
  actions: {
    padding: theme.spacing(1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  fullScreen: {
    '& .MuiDialog-paper': {
      margin: 0,
      maxHeight: '100%',
      height: '100%',
      borderRadius: 0,
    },
  },
}));

function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = false,
  fullScreen: forcedFullScreen = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  showCloseButton = true,
  className,
  ...props
}) {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreenBreakpoint = useMediaQuery(theme.breakpoints.down('sm'));
  const fullScreen = forcedFullScreen || fullScreenBreakpoint;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      className={`${classes.root} ${fullScreen ? classes.fullScreen : ''} ${className || ''}`}
      disableBackdropClick={disableBackdropClick}
      disableEscapeKeyDown={disableEscapeKeyDown}
      {...props}
    >
      {title && (
        <DialogTitle disableTypography className={classes.header}>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
          {showCloseButton && (
            <IconButton
              aria-label="close"
              className={classes.closeButton}
              onClick={onClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent className={classes.content} dividers>
        {children}
      </DialogContent>

      {actions && <DialogActions className={classes.actions}>{actions}</DialogActions>}
    </Dialog>
  );
}

// Predefined modal variants
Modal.Confirm = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  ...props
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    actions={
      <>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button color={confirmColor} onClick={onConfirm} autoFocus>
          {confirmText}
        </Button>
      </>
    }
    maxWidth="xs"
    {...props}
  >
    <Typography>{message}</Typography>
  </Modal>
);

Modal.Alert = ({
  open,
  onClose,
  title = 'Alert',
  message,
  buttonText = 'OK',
  ...props
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    actions={
      <Button onClick={onClose} color="primary" autoFocus>
        {buttonText}
      </Button>
    }
    maxWidth="xs"
    {...props}
  >
    <Typography>{message}</Typography>
  </Modal>
);

Modal.Form = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitColor = 'primary',
  loading = false,
  ...props
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    actions={
      <>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          color={submitColor}
          onClick={onSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {submitText}
        </Button>
      </>
    }
    {...props}
  >
    {children}
  </Modal>
);

export default Modal;
