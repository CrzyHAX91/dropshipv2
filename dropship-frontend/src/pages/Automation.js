import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Switch,
  Slider,
  Button,
  Box,
  Divider,
  FormControlLabel,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardActions,
} from '@material-ui/core';
import {
  AutoFixHigh as AutomationIcon,
  Psychology as AiIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  History as HistoryIcon,
} from '@material-ui/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';

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
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    '& > svg': {
      marginRight: theme.spacing(1),
      color: theme.palette.primary.main,
    },
  },
  slider: {
    width: '100%',
    marginTop: theme.spacing(2),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  infoIcon: {
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  historyButton: {
    marginLeft: 'auto',
  },
}));

function Automation() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    priceOptimization: {
      enabled: true,
      minMargin: 20,
      maxAdjustment: 15,
      frequency: 'daily',
    },
    inventory: {
      enabled: true,
      reorderThreshold: 10,
      maxQuantity: 100,
      suppliers: ['preferred', 'backup'],
    },
    marketing: {
      enabled: false,
      budget: 500,
      channels: ['email', 'social'],
      aiContent: true,
    },
    customerService: {
      enabled: true,
      aiResponses: true,
      responseTime: 'instant',
      languages: ['en', 'es'],
    },
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/automation/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      showToast({
        message: 'Error fetching automation settings',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSettingChange = async (section, setting, value) => {
    try {
      // TODO: Replace with actual API call
      await fetch('/api/automation/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          section,
          setting,
          value,
        }),
      });

      setSettings((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [setting]: value,
        },
      }));

      showToast({
        message: 'Settings updated successfully',
        severity: 'success',
      });
    } catch (error) {
      showToast({
        message: 'Error updating settings',
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
          Automation & AI
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Configure AI-driven automation features to optimize your operations
        </Typography>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <div className={classes.sectionHeader}>
                <AutomationIcon />
                <Typography variant="h6">Price Optimization</Typography>
                <Tooltip title="AI-driven price optimization based on market data, competitor prices, and demand patterns">
                  <IconButton size="small">
                    <InfoIcon className={classes.infoIcon} />
                  </IconButton>
                </Tooltip>
              </div>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.priceOptimization.enabled}
                    onChange={(e) =>
                      handleSettingChange(
                        'priceOptimization',
                        'enabled',
                        e.target.checked
                      )
                    }
                    color="primary"
                  />
                }
                label="Enable automatic price optimization"
              />

              <Typography gutterBottom>
                Minimum Profit Margin: {settings.priceOptimization.minMargin}%
              </Typography>
              <Slider
                value={settings.priceOptimization.minMargin}
                onChange={(_, value) =>
                  handleSettingChange('priceOptimization', 'minMargin', value)
                }
                min={5}
                max={50}
                step={1}
                marks
                className={classes.slider}
                disabled={!settings.priceOptimization.enabled}
              />
            </CardContent>
            <CardActions>
              <Button
                startIcon={<HistoryIcon />}
                onClick={() => setHistoryModalOpen(true)}
                className={classes.historyButton}
              >
                View History
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <div className={classes.sectionHeader}>
                <AiIcon />
                <Typography variant="h6">Inventory Management</Typography>
                <Tooltip title="Automated inventory management with smart reordering and supplier optimization">
                  <IconButton size="small">
                    <InfoIcon className={classes.infoIcon} />
                  </IconButton>
                </Tooltip>
              </div>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.inventory.enabled}
                    onChange={(e) =>
                      handleSettingChange('inventory', 'enabled', e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Enable automatic inventory management"
              />

              <Typography gutterBottom>
                Reorder Threshold: {settings.inventory.reorderThreshold} units
              </Typography>
              <Slider
                value={settings.inventory.reorderThreshold}
                onChange={(_, value) =>
                  handleSettingChange('inventory', 'reorderThreshold', value)
                }
                min={5}
                max={50}
                step={5}
                marks
                className={classes.slider}
                disabled={!settings.inventory.enabled}
              />
            </CardContent>
            <CardActions>
              <Button
                startIcon={<SettingsIcon />}
                onClick={() => {/* TODO: Open settings modal */}}
              >
                Advanced Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Automation History
            </Typography>
            {/* TODO: Add automation history table/timeline */}
          </Paper>
        </Grid>
      </Grid>

      <Modal
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Price Optimization History"
        maxWidth="md"
      >
        {/* TODO: Add price optimization history content */}
        <Typography>Price optimization history will be displayed here</Typography>
      </Modal>
    </div>
  );
}

export default Automation;
