import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  Box,
} from '@material-ui/core';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  Inventory,
  Refresh as RefreshIcon,
} from '@material-ui/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import TopProducts from '../components/TopProducts';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(3),
    height: '100%',
  },
  card: {
    height: '100%',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
  },
  trendUp: {
    color: theme.palette.success.main,
  },
  trendDown: {
    color: theme.palette.error.main,
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 40,
    opacity: 0.7,
  },
  refreshButton: {
    marginLeft: 'auto',
  },
}));

const StatCard = ({ title, value, icon: Icon, trend, loading }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <div className={classes.iconContainer}>
          <Icon className={classes.icon} color="primary" />
        </div>
        {loading ? (
          <LoadingSpinner size={20} />
        ) : (
          <>
            <Typography variant="h4" className={classes.statValue}>
              {value}
            </Typography>
            <Typography variant="body2" className={classes.statLabel}>
              {title}
            </Typography>
            {trend && (
              <Typography
                variant="body2"
                className={trend > 0 ? classes.trendUp : classes.trendDown}
              >
                {trend > 0 ? '+' : ''}{trend}% from last month
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

function Dashboard() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    profit: 0,
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/dashboard/stats');
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

  return (
    <div className={classes.root}>
      <Box mb={3} display="flex" alignItems="center">
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton
          className={classes.refreshButton}
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={AttachMoney}
            trend={12.5}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Orders"
            value={stats.orders}
            icon={ShoppingCart}
            trend={8.2}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Products"
            value={stats.products}
            icon={Inventory}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Profit"
            value={`$${stats.profit.toLocaleString()}`}
            icon={TrendingUp}
            trend={15.8}
            loading={loading}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Top Performing Products
            </Typography>
            <TopProducts />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Dashboard;
