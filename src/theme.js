import { createTheme } from '@mui/material/styles';

export const getCustomTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#3B82F6' : '#0B192C', // Executive Deep Royal Navy
        light: isDark ? '#60A5FA' : '#1E293B',
        dark: isDark ? '#1D4ED8' : '#070F1E',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isDark ? '#F59E0B' : '#C59B27', // Legal Burnished Gold Accent
        light: isDark ? '#FBBF24' : '#EAB308',
        dark: isDark ? '#D97706' : '#9A7B1C',
        contrastText: isDark ? '#000000' : '#FFFFFF',
      },
      info: {
        main: isDark ? '#38BDF8' : '#0284C7',
      },
      success: {
        main: '#10B981',
      },
      warning: {
        main: '#F59E0B',
      },
      error: {
        main: '#EF4444',
      },
      background: {
        default: isDark ? '#070C16' : '#F4F6F9', // Obsidian Navy vs Executive Ivory Slate
        paper: isDark ? '#0F172A' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F8FAFC' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#475569',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
    },
    typography: {
      fontFamily: '"Inter", "Cinzel", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontFamily: '"Cinzel", serif', fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontFamily: '"Cinzel", serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h3: { fontFamily: '"Cinzel", serif', fontSize: '1.75rem', fontWeight: 600 },
      h4: { fontFamily: '"Cinzel", serif', fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontFamily: '"Inter", sans-serif', fontSize: '1.25rem', fontWeight: 700 },
      h6: { fontFamily: '"Inter", sans-serif', fontSize: '1rem', fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: 14,
            boxShadow: isDark 
              ? '0 4px 24px 0 rgba(0, 0, 0, 0.45)' 
              : '0 4px 20px 0 rgba(11, 25, 44, 0.06)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.06)' 
              : '1px solid rgba(15, 23, 42, 0.08)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: isDark
                ? '0 8px 30px 0 rgba(197, 155, 39, 0.15)'
                : '0 10px 30px 0 rgba(11, 25, 44, 0.12)',
              borderColor: isDark ? 'rgba(197, 155, 39, 0.3)' : 'rgba(11, 25, 44, 0.2)',
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: 'none',
            fontWeight: 600,
            '&:hover': {
              boxShadow: isDark ? '0 4px 14px rgba(197,155,39,0.25)' : '0 4px 14px rgba(11,25,44,0.15)',
            }
          },
          containedPrimary: {
            background: isDark 
              ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' 
              : 'linear-gradient(135deg, #0B192C 0%, #1E293B 100%)',
            color: '#FFFFFF',
            border: isDark ? '1px solid rgba(197, 155, 39, 0.3)' : 'none',
            '&:hover': {
              background: isDark 
                ? 'linear-gradient(135deg, #334155 0%, #1E293B 100%)' 
                : 'linear-gradient(135deg, #1E293B 0%, #0B192C 100%)',
            }
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #D4AF37 0%, #C59B27 100%)',
            color: '#000000',
            fontWeight: 700,
            '&:hover': {
              background: 'linear-gradient(135deg, #F59E0B 0%, #D4AF37 100%)',
            }
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: isDark 
              ? '1px solid rgba(197, 155, 39, 0.15)' 
              : '1px solid rgba(15, 23, 42, 0.08)',
            color: isDark ? '#F8FAFC' : '#0F172A',
            boxShadow: 'none',
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isDark ? '#0A0F1D' : '#0B192C', // Deep Executive Dark Sidebar
            color: '#FFFFFF',
            borderRight: isDark 
              ? '1px solid rgba(197, 155, 39, 0.15)' 
              : '1px solid rgba(255, 255, 255, 0.1)',
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
            color: isDark ? '#94A3B8' : '#334155',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
          },
          root: {
            borderBottom: isDark 
              ? '1px solid rgba(255, 255, 255, 0.05)' 
              : '1px solid rgba(15, 23, 42, 0.06)',
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 6,
          }
        }
      }
    }
  });
};
