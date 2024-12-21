import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import {
  TrendingUp,
  TrendingDown,
  MoreVert as MoreVertIcon,
  GetApp as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
} from '@material-ui/icons';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';

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
  chart: {
    height: 300,
    marginTop: theme.spacing(2),
  },
  metricCard: {
    padding: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: 500,
    marginBottom: theme.spacing(1),
  },
  trendUp: {
    color: theme.palette.success.main,
    display: 'flex',
    alignItems: 'center',
  },
  trendDown: {
    color: theme.palette.error.main,
    display: 'flex',
    alignItems: 'center',
  },
  periodSelector: {
    marginBottom: theme.spacing(3),
  },
}));

const periods = ['Today', 'Week', 'Month', 'Quarter', 'Year'];

function Analytics() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Month');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [analytics, setAnalytics] = useState({
    revenue: {
      value: 0,
      trend: 0,
    },
    orders: {
      value: 0,
      trend: 0,
    },
    customers: {
      value: 0,
      trend: 0,
    },
    conversion: {
      value: 0,
      trend: 0,
    },
    topProducts: [],
    customerSegments: [],
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch(`/api/analytics?period=${selectedPeriod.toLowerCase()}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      showToast({
        message: 'Error fetching analytics data',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod]);

  const handleExport = (format) => {
    showToast({
      message: `Exporting analytics as ${format}...`,
      severity: 'info',
    });
    setMenuAnchor(null);
  };

  const renderTrend = (value) => {
    if (value > 0) {
      return (
        <span className={classes.trendUp}>
          <TrendingUp fontSize="small" style={{ marginRight: 4 }} />
          {value}%
        </span>
      );
    }
    return (
      <span className={classes.trendDown}>
        <TrendingDown fontSize="small" style={{ marginRight: 4 }} />
        {Math.abs(value)}%
      </span>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4">Analytics</Typography>
        <div>
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem onClick={() => handleExport('pdf')}>
              <DownloadIcon fontSize="small" style={{ marginRight: 8 }} />
              Export as PDF
            </MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>
              <DownloadIcon fontSize="small" style={{ marginRight: 8 }} />
              Export as CSV
            </MenuItem>
            <MenuItem onClick={() => handleExport('print')}>
              <PrintIcon fontSize="small" style={{ marginRight: 8 }} />
              Print Report
            </MenuItem>
            <MenuItem onClick={() => handleExport('share')}>
              <ShareIcon fontSize="small" style={{ marginRight: 8 }} />
              Share Report
            </MenuItem>
          </Menu>
        </div>
      </div>

      <ButtonGroup className={classes.periodSelector}>
        {periods.map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'contained' : 'outlined'}
            color={selectedPeriod === period ? 'primary' : 'default'}
            onClick={() => setSelectedPeriod(period)}
          >
            {period}
          </Button>
        ))}
      </ButtonGroup>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.metricCard}>
            <Typography variant="subtitle2" color="textSecondary">
              Revenue
            </Typography>
            <Typography className={classes.metricValue}>
              ${analytics.revenue.value.toLocaleString()}
            </Typography>
            {renderTrend(analytics.revenue.trend)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.metricCard}>
            <Typography variant="subtitle2" color="textSecondary">
              Orders
            </Typography>
            <Typography className={classes.metricValue}>
              {analytics.orders.value.toLocaleString()}
            </Typography>
            {renderTrend(analytics.orders.trend)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.metricCard}>
            <Typography variant="subtitle2" color="textSecondary">
              New Customers
            </Typography>
            <Typography className={classes.metricValue}>
              {analytics.customers.value.toLocaleString()}
            </Typography>
            {renderTrend(analytics.customers.trend)}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper className={classes.metricCard}>
            <Typography variant="subtitle2" color="textSecondary">
              Conversion Rate
            </Typography>
            <Typography className={classes.metricValue}>
              {analytics.conversion.value}%
            </Typography>
            {renderTrend(analytics.conversion.trend)}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Top Performing Products
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Orders</TableCell>
                    <TableCell align="right">Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell align="right">
                        ${product.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {product.orders.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {renderTrend(product.trend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper className={classes.paper}>
            <Typography variant="h6" gutterBottom>
              Customer Segments
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell align="right">Customers</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics.customerSegments.map((segment) => (
                    <TableRow key={segment.id}>
                      <TableCell>{segment.name}</TableCell>
                      <TableCell align="right">
                        {segment.customers.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ${segment.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {renderTrend(segment.growth)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Analytics;
