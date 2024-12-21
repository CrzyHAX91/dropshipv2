import { create } from '@mui/material/styles';
import { motion } from 'framer-motion';

class UIService {
    constructor() {
        // Theme configuration
        this.theme = create({
            palette: {
                primary: {
                    main: '#2196f3',
                    light: '#64b5f6',
                    dark: '#1976d2',
                    contrastText: '#fff'
                },
                secondary: {
                    main: '#ff4081',
                    light: '#ff79b0',
                    dark: '#c60055',
                    contrastText: '#fff'
                },
                gradient: {
                    primary: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
                    secondary: 'linear-gradient(45deg, #ff4081 30%, #ff9100 90%)',
                    success: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                    warning: 'linear-gradient(45deg, #ff9800 30%, #ffc107 90%)'
                }
            },
            typography: {
                fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
                h1: {
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: '-0.01562em'
                },
                h2: {
                    fontSize: '2rem',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: '-0.00833em'
                }
            },
            shape: {
                borderRadius: 12
            },
            shadows: [
                'none',
                '0px 2px 4px rgba(0,0,0,0.1)',
                '0px 4px 8px rgba(0,0,0,0.1)',
                '0px 8px 16px rgba(0,0,0,0.1)',
                '0px 16px 24px rgba(0,0,0,0.1)',
                '0px 24px 32px rgba(0,0,0,0.1)'
            ]
        });

        // Animation configurations
        this.animations = {
            fadeIn: {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                transition: { duration: 0.5 }
            },
            slideUp: {
                initial: { y: 50, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                transition: { duration: 0.5 }
            },
            scale: {
                initial: { scale: 0.9, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                transition: { duration: 0.5 }
            },
            stagger: {
                animate: { transition: { staggerChildren: 0.1 } }
            }
        };

        // Component styles
        this.styles = {
            card: {
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)'
                }
            },
            button: {
                borderRadius: '30px',
                padding: '12px 32px',
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0px 6px 20px rgba(0, 0, 0, 0.15)'
                }
            },
            input: {
                borderRadius: '8px',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                transition: 'all 0.3s ease-in-out',
                '&:focus': {
                    borderColor: '#2196f3',
                    boxShadow: '0px 0px 8px rgba(33, 150, 243, 0.2)'
                }
            }
        };

        // Layout components
        this.layouts = {
            container: motion.div,
            section: motion.section,
            card: motion.div,
            button: motion.button
        };
    }

    // Get theme-based styles
    getStyles(component) {
        return {
            ...this.styles[component],
            ...this.theme.components?.[component]?.styleOverrides
        };
    }

    // Get animation configuration
    getAnimation(type) {
        return this.animations[type];
    }

    // Get theme configuration
    getTheme() {
        return this.theme;
    }

    // Get layout component
    getLayout(type) {
        return this.layouts[type];
    }

    // Generate gradient text
    getGradientText(text, colors = ['#2196f3', '#21cbf3']) {
        return {
            background: `linear-gradient(45deg, ${colors[0]} 30%, ${colors[1]} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent'
        };
    }

    // Generate shadow effect
    getShadow(level = 1) {
        return this.theme.shadows[level];
    }

    // Generate responsive styles
    getResponsiveStyles(styles) {
        return {
            xs: styles.xs || {},
            sm: styles.sm || {},
            md: styles.md || {},
            lg: styles.lg || {},
            xl: styles.xl || {}
        };
    }

    // Generate hover effects
    getHoverEffect(type = 'scale') {
        const effects = {
            scale: {
                transform: 'scale(1.05)',
                transition: 'transform 0.3s ease-in-out'
            },
            lift: {
                transform: 'translateY(-5px)',
                transition: 'transform 0.3s ease-in-out'
            },
            glow: {
                boxShadow: '0px 0px 20px rgba(33, 150, 243, 0.3)',
                transition: 'box-shadow 0.3s ease-in-out'
            }
        };

        return effects[type];
    }

    // Generate loading states
    getLoadingState(type = 'pulse') {
        const states = {
            pulse: {
                animation: 'pulse 1.5s ease-in-out infinite'
            },
            shimmer: {
                animation: 'shimmer 2s linear infinite',
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%'
            },
            skeleton: {
                background: '#f0f0f0',
                borderRadius: '4px'
            }
        };

        return states[type];
    }

    // Generate animations
    getAnimationConfig(type, custom = {}) {
        return {
            ...this.animations[type],
            ...custom
        };
    }
}

export default new UIService();
