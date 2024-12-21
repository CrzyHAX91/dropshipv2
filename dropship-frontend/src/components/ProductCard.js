import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  AddShoppingCart as AddToCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  media: {
    paddingTop: '75%', // 4:3 aspect ratio
    position: 'relative',
  },
  content: {
    flexGrow: 1,
  },
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(1, 2),
  },
  priceSection: {
    display: 'flex',
    alignItems: 'baseline',
    marginBottom: theme.spacing(1),
  },
  originalPrice: {
    textDecoration: 'line-through',
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  discountPrice: {
    color: theme.palette.error.main,
    fontWeight: 'bold',
  },
  discount: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: theme.palette.error.main,
  },
  trending: {
    position: 'absolute',
    top: theme.spacing(1),
    left: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
  stockStatus: {
    marginTop: theme.spacing(1),
  },
  lowStock: {
    backgroundColor: theme.palette.error.light,
  },
  inStock: {
    backgroundColor: theme.palette.success.light,
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
  favorite: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.error.main,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
}));

function ProductCard({
  product,
  onAddToCart,
  onEdit,
  onToggleFavorite,
  isAdmin = false,
}) {
  const classes = useStyles();
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    image,
    stock,
    sales,
    rating,
    isFavorite,
    isTrending,
  } = product;

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const isLowStock = stock < 10;

  return (
    <Card className={classes.root}>
      <CardMedia className={classes.media} image={image} title={name}>
        {discount > 0 && (
          <Chip
            label={`-${discount}%`}
            size="small"
            className={classes.discount}
          />
        )}
        {isTrending && (
          <Chip
            icon={<TrendingUpIcon />}
            label="Trending"
            size="small"
            className={classes.trending}
          />
        )}
        <IconButton
          className={classes.favorite}
          onClick={() => onToggleFavorite(id)}
          size="small"
        >
          {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </CardMedia>

      <CardContent className={classes.content}>
        <Typography gutterBottom variant="h6" component="h2">
          {name}
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          component="p"
          gutterBottom
        >
          {description}
        </Typography>

        <div className={classes.priceSection}>
          {originalPrice && (
            <Typography
              variant="body1"
              className={classes.originalPrice}
            >
              ${originalPrice.toFixed(2)}
            </Typography>
          )}
          <Typography variant="h6" className={classes.discountPrice}>
            ${price.toFixed(2)}
          </Typography>
        </div>

        <Chip
          label={isLowStock ? `Only ${stock} left` : `${stock} in stock`}
          size="small"
          className={`${classes.stockStatus} ${
            isLowStock ? classes.lowStock : classes.inStock
          }`}
        />

        <Box className={classes.stats}>
          <Typography variant="body2">
            {sales} sold
          </Typography>
          <Typography variant="body2">
            ★ {rating.toFixed(1)}
          </Typography>
        </Box>
      </CardContent>

      <CardActions className={classes.actions}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddToCartIcon />}
          onClick={() => onAddToCart(id)}
          disabled={stock === 0}
          fullWidth={!isAdmin}
        >
          Add to Cart
        </Button>
        {isAdmin && (
          <Tooltip title="Edit Product">
            <IconButton onClick={() => onEdit(id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}

export default ProductCard;
