import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Container } from '@material-ui/core';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/common/ErrorBoundary';
import { ToastProvider } from './components/common/Toast';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProductList from './pages/ProductList';
import Analytics from './pages/Analytics';
import DataManagement from './pages/DataManagement';
import Automation from './pages/Automation';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
    flex: 1,
  },
}));

function App() {
  const classes = useStyles();

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className={classes.root}>
          <Header />
          <Container component="main" className={classes.main}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/data" element={<DataManagement />} />
              <Route path="/automation" element={<Automation />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
