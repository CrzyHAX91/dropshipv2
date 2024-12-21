import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from '@material-ui/core';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  footer: {
    padding: theme.spacing(6, 0),
    marginTop: 'auto',
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  logo: {
    marginBottom: theme.spacing(2),
  },
  socialIcons: {
    marginTop: theme.spacing(2),
  },
  icon: {
    margin: theme.spacing(0, 1),
  },
  divider: {
    margin: theme.spacing(3, 0),
  },
  linkSection: {
    margin: theme.spacing(2, 0),
  },
  copyright: {
    marginTop: theme.spacing(4),
  },
}));

function Footer() {
  const classes = useStyles();
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" className={classes.logo}>
              Dropship Platform
            </Typography>
            <Typography variant="body2" color="textSecondary">
              AI-driven dropshipping solution for modern e-commerce businesses.
            </Typography>
            <div className={classes.socialIcons}>
              <IconButton
                color="primary"
                className={classes.icon}
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                color="primary"
                className={classes.icon}
                aria-label="Twitter"
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                color="primary"
                className={classes.icon}
                aria-label="LinkedIn"
                component="a"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                color="primary"
                className={classes.icon}
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </IconButton>
            </div>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom>
              Platform
            </Typography>
            <div className={classes.linkSection}>
              <Link component={RouterLink} to="/features" color="textSecondary" display="block">
                Features
              </Link>
              <Link component={RouterLink} to="/pricing" color="textSecondary" display="block">
                Pricing
              </Link>
              <Link component={RouterLink} to="/security" color="textSecondary" display="block">
                Security
              </Link>
              <Link component={RouterLink} to="/updates" color="textSecondary" display="block">
                Updates
              </Link>
            </div>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <div className={classes.linkSection}>
              <Link component={RouterLink} to="/help" color="textSecondary" display="block">
                Help Center
              </Link>
              <Link component={RouterLink} to="/docs" color="textSecondary" display="block">
                Documentation
              </Link>
              <Link component={RouterLink} to="/api" color="textSecondary" display="block">
                API Reference
              </Link>
              <Link component={RouterLink} to="/status" color="textSecondary" display="block">
                System Status
              </Link>
            </div>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <div className={classes.linkSection}>
              <Link component={RouterLink} to="/about" color="textSecondary" display="block">
                About Us
              </Link>
              <Link component={RouterLink} to="/contact" color="textSecondary" display="block">
                Contact
              </Link>
              <Link component={RouterLink} to="/careers" color="textSecondary" display="block">
                Careers
              </Link>
              <Link component={RouterLink} to="/blog" color="textSecondary" display="block">
                Blog
              </Link>
            </div>
          </Grid>
        </Grid>

        <Divider className={classes.divider} />

        <Typography
          variant="body2"
          color="textSecondary"
          align="center"
          className={classes.copyright}
        >
          © {currentYear} Dropship Platform. All rights reserved.
        </Typography>
      </Container>
    </footer>
  );
}

export default Footer;
