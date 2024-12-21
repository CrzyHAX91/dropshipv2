import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Drawer,
  IconButton,
  Divider,
  Slider,
  Chip,
} from '@material-ui/core';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@material-ui/icons';
import ProductCard from '../components/ProductCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(4),
  },
  searchBar: {
    display: 'flex',
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
  },
  search: {
    flexGrow: 1,
  },
  filterDrawer: {
    width: 320,
    padding: theme.spacing(3),
  },
  filterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  filterSection: {
    marginBottom: theme.spacing(3),
  },
  priceRange: {
    marginTop: theme.spacing(2),
  },
  activeFilters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  noResults: {
    textAlign: 'center',
    marginTop: theme.spacing(4),
  },
}));

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const categories = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Toys',
];

function ProductList() {
  const classes = useStyles();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    sortBy: 'popular',
    priceRange: [0, 1000],
    inStock: false,
    onSale: false,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const response = await fetch('/api/products?' + new URLSearchParams(filters));
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showToast({
        message: 'Error fetching products',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = (productId) => {
    showToast({
      message: 'Product added to cart',
      severity: 'success',
    });
  };

  const handleToggleFavorite = (productId) => {
    // TODO: Implement favorite toggle logic
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All Categories',
      sortBy: 'popular',
      priceRange: [0, 1000],
      inStock: false,
      onSale: false,
    });
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography variant="h4" gutterBottom>
          Products
        </Typography>
        <div className={classes.searchBar}>
          <TextField
            className={classes.search}
            variant="outlined"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" />,
            }}
          />
          <FormControl variant="outlined" style={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              label="Sort By"
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setDrawerOpen(true)}
          >
            Filters
          </Button>
        </div>

        {Object.keys(filters).some((key) => {
          if (key === 'priceRange') {
            return filters[key][0] !== 0 || filters[key][1] !== 1000;
          }
          return filters[key] && filters[key] !== 'All Categories';
        }) && (
          <Box className={classes.activeFilters}>
            {filters.category !== 'All Categories' && (
              <Chip
                label={`Category: ${filters.category}`}
                onDelete={() => handleFilterChange('category', 'All Categories')}
              />
            )}
            {filters.inStock && (
              <Chip
                label="In Stock Only"
                onDelete={() => handleFilterChange('inStock', false)}
              />
            )}
            {filters.onSale && (
              <Chip
                label="On Sale"
                onDelete={() => handleFilterChange('onSale', false)}
              />
            )}
            <Button size="small" onClick={clearFilters}>
              Clear All
            </Button>
          </Box>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className={classes.noResults}>
          <Typography variant="h6" color="textSecondary">
            No products found
          </Typography>
          <Button color="primary" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      )}

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <div className={classes.filterDrawer}>
          <div className={classes.filterHeader}>
            <Typography variant="h6">Filters</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          <Divider />

          <div className={classes.filterSection}>
            <Typography variant="subtitle1" gutterBottom>
              Category
            </Typography>
            <FormControl fullWidth variant="outlined">
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className={classes.filterSection}>
            <Typography variant="subtitle1" gutterBottom>
              Price Range
            </Typography>
            <Slider
              value={filters.priceRange}
              onChange={(_, value) => handleFilterChange('priceRange', value)}
              valueLabelDisplay="auto"
              min={0}
              max={1000}
              className={classes.priceRange}
            />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="textSecondary">
                ${filters.priceRange[0]}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ${filters.priceRange[1]}
              </Typography>
            </Box>
          </div>

          <div className={classes.filterSection}>
            <FormControl fullWidth>
              <Button
                variant={filters.inStock ? 'contained' : 'outlined'}
                color={filters.inStock ? 'primary' : 'default'}
                onClick={() => handleFilterChange('inStock', !filters.inStock)}
              >
                In Stock Only
              </Button>
            </FormControl>
          </div>

          <div className={classes.filterSection}>
            <FormControl fullWidth>
              <Button
                variant={filters.onSale ? 'contained' : 'outlined'}
                color={filters.onSale ? 'primary' : 'default'}
                onClick={() => handleFilterChange('onSale', !filters.onSale)}
              >
                On Sale
              </Button>
            </FormControl>
          </div>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              Apply Filters
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={clearFilters}
              style={{ marginTop: 8 }}
            >
              Clear All
            </Button>
          </Box>
        </div>
      </Drawer>
    </div>
  );
}

export default ProductList;
