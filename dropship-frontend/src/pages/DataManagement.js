import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  LinearProgress,
  Box,
  Chip,
  Tooltip,
} from '@material-ui/core';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Delete as DeleteIcon,
  Restore as RestoreIcon,
  History as HistoryIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
} from '@material-ui/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';
import { Form, FormField } from '../components/common/Form';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
  },
  uploadZone: {
    border: `2px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(3),
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
    cursor: 'pointer',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
  },
  hiddenInput: {
    display: 'none',
  },
  actionButton: {
    marginRight: theme.spacing(2),
  },
  statusChip: {
    marginRight: theme.spacing(1),
  },
  progress: {
    marginTop: theme.spacing(2),
  },
  successIcon: {
    color: theme.palette.success.main,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
  scheduleIcon: {
    color: theme.palette.warning.main,
  },
}));

function DataManagement() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [backups, setBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/data/backups');
      const data = await response.json();
      setBackups(data);
    } catch (error) {
      showToast({
        message: 'Error fetching backup history',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      // Simulated upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // TODO: Replace with actual API call
      await fetch('/api/data/import', {
        method: 'POST',
        body: formData,
      });

      showToast({
        message: 'File uploaded successfully',
        severity: 'success',
      });
    } catch (error) {
      showToast({
        message: 'Error uploading file',
        severity: 'error',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleExport = async (format) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/data/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dropship-data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast({
        message: `Data exported successfully as ${format.toUpperCase()}`,
        severity: 'success',
      });
    } catch (error) {
      showToast({
        message: 'Error exporting data',
        severity: 'error',
      });
    }
  };

  const handleCreateBackup = async () => {
    try {
      // TODO: Replace with actual API call
      await fetch('/api/data/backup', { method: 'POST' });
      showToast({
        message: 'Backup created successfully',
        severity: 'success',
      });
      fetchBackups();
    } catch (error) {
      showToast({
        message: 'Error creating backup',
        severity: 'error',
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;

    try {
      // TODO: Replace with actual API call
      await fetch(`/api/data/restore/${selectedBackup.id}`, {
        method: 'POST',
      });
      showToast({
        message: 'System restored successfully',
        severity: 'success',
      });
      setRestoreModalOpen(false);
    } catch (error) {
      showToast({
        message: 'Error restoring system',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" gutterBottom>
          Data Management
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Import, export, and manage your system data
        </Typography>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Import Data
            </Typography>
            <input
              type="file"
              id="file-upload"
              className={classes.hiddenInput}
              onChange={handleFileUpload}
              accept=".csv,.json,.xlsx"
            />
            <label htmlFor="file-upload">
              <div className={classes.uploadZone}>
                <UploadIcon fontSize="large" color="action" />
                <Typography variant="body1" gutterBottom>
                  Drag and drop files here or click to browse
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Supported formats: CSV, JSON, XLSX
                </Typography>
              </div>
            </label>
            {uploading && (
              <Box className={classes.progress}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="textSecondary" align="center">
                  Uploading... {uploadProgress}%
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Export Data
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
              className={classes.actionButton}
            >
              Export as CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
              className={classes.actionButton}
            >
              Export as JSON
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('xlsx')}
            >
              Export as Excel
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">Backup History</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<HistoryIcon />}
                onClick={handleCreateBackup}
              >
                Create Backup
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        {new Date(backup.date).toLocaleString()}
                      </TableCell>
                      <TableCell>{backup.type}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            backup.status === 'completed' ? (
                              <SuccessIcon className={classes.successIcon} />
                            ) : backup.status === 'failed' ? (
                              <ErrorIcon className={classes.errorIcon} />
                            ) : (
                              <ScheduleIcon className={classes.scheduleIcon} />
                            )
                          }
                          label={backup.status}
                          className={classes.statusChip}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Restore">
                          <IconButton
                            onClick={() => {
                              setSelectedBackup(backup);
                              setRestoreModalOpen(true);
                            }}
                          >
                            <RestoreIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Modal
        open={restoreModalOpen}
        onClose={() => setRestoreModalOpen(false)}
        title="Restore System"
        maxWidth="sm"
      >
        <Typography gutterBottom>
          Are you sure you want to restore the system to this backup point? This
          action cannot be undone.
        </Typography>
        <Typography variant="body2" color="error" paragraph>
          Warning: All current data will be replaced with the backup data.
        </Typography>
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button
            onClick={() => setRestoreModalOpen(false)}
            className={classes.actionButton}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRestore}
            startIcon={<RestoreIcon />}
          >
            Restore System
          </Button>
        </Box>
      </Modal>
    </div>
  );
}

export default DataManagement;
