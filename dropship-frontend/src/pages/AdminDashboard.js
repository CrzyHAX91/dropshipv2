import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import {
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  CloudDownload as ExportIcon,
  Settings as SettingsIcon,
} from '@material-ui/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import TopProducts from '../components/TopProducts';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
  },
  tabPanel: {
    marginTop: theme.spacing(3),
  },
  chart: {
    height: 300,
  },
  statCard: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
  },
  actionButton: {
    marginLeft: theme.spacing(1),
  },
}));

function TabPanel({ children, value, index }) {
  return value === index && <div>{children}</div>;
}

function AdminDashboard() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    metrics: {
      conversion: 0,
      aov: 0,
      retention: 0,
    },
    inventory: {
      lowStock: 0,
      outOfStock: 0,
      total: 0,
    },
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      showToast({
        message: 'Error fetching dashboard data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const handleExport = () => {
    showToast({
      message: 'Exporting dashboard data...',
      severity: 'info',
    });
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <div>
          <Button
            startIcon={<ExportIcon />}
            onClick={handleExport}
            className={classes.actionButton}
          >
            Export
          </Button>
          <IconButton onClick={handleRefresh} className={classes.actionButton}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleMenuOpen} className={classes.actionButton}>
            <MoreVertIcon />
          </IconButton>
        </div>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <SettingsIcon fontSize="small" style={{ marginRight: 8 }} />
            Dashboard Settings
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>Customize View</MenuItem>
          <MenuItem onClick={handleMenuClose}>Manage Notifications</MenuItem>
        </Menu>
      </div>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statValue}>
              ${stats.revenue.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>Total Revenue</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statValue}>
              {stats.orders.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>Total Orders</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statValue}>
              {stats.customers.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>Total Customers</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.statCard}>
            <Typography className={classes.statValue}>
              {stats.products.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>Total Products</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box mt={4}>
        <Paper>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Performance" />
            <Tab label="Inventory" />
            <Tab label="Top Products" />
          </Tabs>

          <div className={classes.tabPanel}>
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                      Conversion Rate
                    </Typography>
                    <Typography variant="h3">
                      {stats.metrics.conversion}%
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                      Average Order Value
                    </Typography>
                    <Typography variant="h3">
                      ${stats.metrics.aov}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                      Customer Retention
                    </Typography>
                    <Typography variant="h3">
                      {stats.metrics.retention}%
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                      Low Stock Items
                    </Typography>
                    <Typography variant="h3" color="error">
                      {stats.inventory.lowStock}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                      Out of Stock
                    </Typography>
                    <Typography variant="h3" color="error">
                      {stats.inventory.outOfStock}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper className={classes.paper}>
                    <Typography variant="h6" gutterBottom>
                      Total SKUs
                    </Typography>
                    <Typography variant="h3">
                      {stats.inventory.total}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <TopProducts />
            </TabPanel>
          </div>
        </Paper>
      </Box>
    </div>
  );
}

export default AdminDashboard;
