import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from '@material-ui/core';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@material-ui/icons';
import { LoadingSpinner } from './common/LoadingSpinner';
import { useToast } from './common/Toast';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  container: {
    maxHeight: 440,
  },
  trendUp: {
    color: theme.palette.success.main,
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing(0.5),
    },
  },
  trendDown: {
    color: theme.palette.error.main,
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: theme.spacing(0.5),
    },
  },
  stockLow: {
    backgroundColor: theme.palette.error.light,
  },
  stockMedium: {
    backgroundColor: theme.palette.warning.light,
  },
  stockGood: {
    backgroundColor: theme.palette.success.light,
  },
  progressBar: {
    width: '100%',
    marginTop: theme.spacing(0.5),
  },
  imageCell: {
    width: 60,
    '& img': {
      width: 50,
      height: 50,
      objectFit: 'cover',
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

function TopProducts() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/products/top');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showToast({
        message: 'Error fetching top products',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const getStockStatus = (stock) => {
    if (stock < 10) return { label: 'Low Stock', className: classes.stockLow };
    if (stock < 50) return { label: 'Medium Stock', className: classes.stockMedium };
    return { label: 'In Stock', className: classes.stockGood };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Product</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Sales</TableCell>
              <TableCell align="right">Revenue</TableCell>
              <TableCell align="right">Stock</TableCell>
              <TableCell align="right">Trend</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <TableRow key={product.id} hover>
                  <TableCell className={classes.imageCell}>
                    <img src={product.image} alt={product.name} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{product.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {product.sku}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      ${product.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      {product.sales.toLocaleString()}
                    </Typography>
                    <Box className={classes.progressBar}>
                      <LinearProgress
                        variant="determinate"
                        value={(product.sales / Math.max(...products.map(p => p.sales))) * 100}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2">
                      ${product.revenue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${product.stock} units`}
                      size="small"
                      className={stockStatus.className}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box
                      className={product.trend >= 0 ? classes.trendUp : classes.trendDown}
                    >
                      {product.trend >= 0 ? (
                        <TrendingUpIcon fontSize="small" />
                      ) : (
                        <TrendingDownIcon fontSize="small" />
                      )}
                      <Typography variant="body2">
                        {Math.abs(product.trend)}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default TopProducts;
