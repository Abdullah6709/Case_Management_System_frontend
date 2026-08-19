import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const DataTable = ({
  title,
  headerAction,
  columns,
  rows,
  searchPlaceholder = 'Search records...',
  searchField = 'fullName',
  onRowClick,
  actions,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filter rows locally if needed
  const filteredRows = rows.filter((row) => {
    if (!searchQuery) return true;
    
    // Check search fields (simple recursive scan or custom field match)
    if (searchField) {
      const val = row[searchField];
      return val ? String(val).toLowerCase().includes(searchQuery.toLowerCase()) : false;
    }
    
    // Generic fallback scan
    return Object.values(row).some((val) =>
      val ? String(val).toLowerCase().includes(searchQuery.toLowerCase()) : false
    );
  });

  const paginatedRows = filteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.25,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {title ? (
          typeof title === 'string' ? (
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.01em' }}>
              {title}
            </Typography>
          ) : (
            title
          )
        ) : (
          <Box />
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, ml: 'auto' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              width: { xs: '100%', sm: 260 },
              '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          {headerAction}
        </Box>
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 1.5,
          boxShadow: 'none',
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    whiteSpace: 'nowrap',
                    py: 0.75,
                    px: 1.25,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              {actions && (
                <TableCell
                  align="right"
                  sx={{
                    py: 0.75,
                    px: 1.25,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No records found.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': { bgcolor: 'rgba(212, 175, 55, 0.04)' },
                  }}
                >
                  {columns.map((col) => {
                    const value = row[col.id];
                    return (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        sx={{
                          py: 0.5,
                          px: 1.25,
                          fontSize: '0.82rem',
                          lineHeight: 1.25,
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        {col.render ? col.render(row) : (value !== null && value !== undefined ? String(value) : '—')}
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell
                      align="right"
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        py: 0.5,
                        px: 1.25,
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          '.MuiTablePagination-toolbar': { minHeight: 34, py: 0 },
          '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.78rem' },
        }}
      />
    </Box>
  );
};

export default DataTable;
