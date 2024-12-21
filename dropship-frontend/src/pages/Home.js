import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import {
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
} from '@material-ui/core';
import {
  Speed as SpeedIcon,
  Psychology as AiIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  hero: {
    padding: theme.spacing(8, 0, 6),
    backgroundColor: theme.palette.background.paper,
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  featureCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  section: {
    padding: theme.spacing(8, 0),
  },
  sectionDark: {
    backgroundColor: theme.palette.grey[100],
  },
}));

const features = [
  {
    title: 'AI-Powered Automation',
    description: 'Leverage advanced AI algorithms for automated product sourcing, pricing optimization, and inventory management.',
    icon: AiIcon,
  },
  {
    title: 'Real-time Analytics',
    description: 'Get detailed insights into your business performance with real-time analytics and reporting.',
    icon: AnalyticsIcon,
  },
  {
    title: 'Enhanced Security',
    description: 'Enterprise-grade security features to protect your business and customer data.',
    icon: SecurityIcon,
  },
  {
    title: 'High Performance',
    description: 'Lightning-fast operations and seamless integration with major e-commerce platforms.',
    icon: SpeedIcon,
  },
];

function Home() {
  const classes = useStyles();

  return (
    <div>
      <div className={classes.hero}>
        <Container maxWidth="sm" className={classes.heroContent}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="textPrimary"
            gutterBottom
          >
            Dropship Platform
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            Transform your e-commerce business with AI-powered dropshipping automation.
            Streamline operations, optimize pricing, and scale your business effortlessly.
          </Typography>
          <div className={classes.heroButtons}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/signup"
                  variant="contained"
                  color="primary"
                  size="large"
                >
                  Get Started
                </Button>
              </Grid>
              <Grid item>
                <Button
                  component={RouterLink}
                  to="/demo"
                  variant="outlined"
                  color="primary"
                  size="large"
                >
                  Live Demo
                </Button>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>

      <Container className={classes.section} maxWidth="lg">
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item key={feature.title} xs={12} sm={6} md={3}>
              <Card className={classes.featureCard}>
                <CardContent>
                  <feature.icon className={classes.featureIcon} />
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography color="textSecondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box className={`${classes.section} ${classes.sectionDark}`}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            Ready to Scale Your Business?
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            Join thousands of successful entrepreneurs who have transformed their
            e-commerce business with our platform.
          </Typography>
          <Box mt={4} textAlign="center">
            <Button
              component={RouterLink}
              to="/signup"
              variant="contained"
              color="primary"
              size="large"
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>
    </div>
  );
}

export default Home;
