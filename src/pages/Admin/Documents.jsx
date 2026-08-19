import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';
import DocumentPreviewModal from '../../components/Common/DocumentPreviewModal.jsx';

const Documents = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [docCounts, setDocCounts] = useState({});
  const [lastUploadDates, setLastUploadDates] = useState({});
  const [loading, setLoading] = useState(true);

  // Selected Case & Documents View/Manage Modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [caseDocs, setCaseDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Search & Filter within View Modal
  const [modalDocSearch, setModalDocSearch] = useState('');
  const [modalCatFilter, setModalCatFilter] = useState('');

  // Document Upload Dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTargetCase, setUploadTargetCase] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Petition');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Document Edit Dialog
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editFileName, setEditFileName] = useState('');
  const [editCategory, setEditCategory] = useState('Petition');
  const [editReplacementFile, setEditReplacementFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const categories = [
    'Petition',
    'FIR',
    'Charge Sheet',
    'Affidavit',
    'Evidence',
    'Court Order',
    'Judgment Copy',
    'Other',
  ];

  // Fetch all cases and document counts
  const fetchCasesAndCounts = async () => {
    try {
      const [casesRes, docsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/firm/cases?limit=200'),
        axios.get('http://localhost:5000/api/firm/documents'),
      ]);

      const casesData = casesRes.data.cases || [];
      const docsData = docsRes.data || [];

      // Count documents and track latest upload date per case
      const counts = {};
      const latestDates = {};
      docsData.forEach((d) => {
        const cid = (d.case?.id || d.case?._id || d.caseId?.id || d.caseId?._id || d.caseId || '').toString();
        if (cid) {
          counts[cid] = (counts[cid] || 0) + 1;
          const docDate = new Date(d.uploadedAt || d.createdAt);
          if (!latestDates[cid] || docDate > new Date(latestDates[cid])) {
            latestDates[cid] = d.uploadedAt || d.createdAt;
          }
        }
      });

      setCases(casesData);
      setDocCounts(counts);
      setLastUploadDates(latestDates);

      // Check if URL has ?caseId=xxx
      const params = new URLSearchParams(location.search);
      const urlCaseId = params.get('caseId');
      if (urlCaseId) {
        const matched = casesData.find((c) => (c.id || c._id).toString() === urlCaseId);
        if (matched) {
          handleOpenViewDialog(matched);
        }
      }
    } catch (err) {
      console.error('Error fetching cases or documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCasesAndCounts();
  }, []);

  // Fetch documents for the selected case
  const fetchCaseDocs = async (cId) => {
    setLoadingDocs(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/firm/documents?caseId=${cId}`);
      setCaseDocs(res.data || []);
    } catch (err) {
      console.error('Error fetching case documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Open View/Manage Documents Dialog
  const handleOpenViewDialog = (caseItem) => {
    setSelectedCase(caseItem);
    setViewDialogOpen(true);
    setModalDocSearch('');
    setModalCatFilter('');
    const cid = caseItem.id || caseItem._id;
    fetchCaseDocs(cid);
  };

  // Open Upload Dialog for a specific case
  const handleOpenUpload = (caseItem) => {
    setUploadTargetCase(caseItem);
    setUploadCategory('Petition');
    setUploadFile(null);
    setUploadError('');
    setUploadOpen(true);
  };

  // Upload handler
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a document file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const cid = uploadTargetCase?.id || uploadTargetCase?._id;
      const formData = new FormData();
      formData.append('caseId', cid);
      formData.append('category', uploadCategory);
      formData.append('file', uploadFile);

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/firm/documents', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setUploadOpen(false);
      setUploadFile(null);
      fetchCasesAndCounts();
      if (selectedCase && (selectedCase.id || selectedCase._id) === cid) {
        fetchCaseDocs(cid);
      }
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Open Document Edit Dialog
  const handleOpenEditDoc = (doc) => {
    setEditingDoc(doc);
    setEditFileName(doc.fileName || '');
    setEditCategory(doc.category || 'Petition');
    setEditReplacementFile(null);
    setEditError('');
    setEditDocOpen(true);
  };

  // Handle Document Edit Submit
  const handleEditDocSubmit = async (e) => {
    e.preventDefault();
    if (!editFileName.trim()) {
      setEditError('Document name cannot be empty');
      return;
    }

    setEditing(true);
    setEditError('');

    try {
      const formData = new FormData();
      formData.append('fileName', editFileName.trim());
      formData.append('category', editCategory);
      if (editReplacementFile) {
        formData.append('file', editReplacementFile);
      }

      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/firm/documents/${editingDoc.id || editingDoc._id}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setEditDocOpen(false);
      setEditingDoc(null);
      setEditReplacementFile(null);
      if (selectedCase) {
        fetchCaseDocs(selectedCase.id || selectedCase._id);
      }
      fetchCasesAndCounts();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setEditing(false);
    }
  };

  const getCleanFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const clean = url.replace(/\\/g, '/');
    const pathStr = clean.startsWith('/') ? clean : '/' + clean;
    return `http://localhost:5000${pathStr}`;
  };

  const handleDownloadDoc = (docItem) => {
    const fullUrl = getCleanFileUrl(docItem.fileUrl);
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = docItem.fileName || 'document';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 100);
  };

  // Delete Individual Document handler
  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from the case vault?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/firm/documents/${id}`);
      if (selectedCase) {
        fetchCaseDocs(selectedCase.id || selectedCase._id);
      }
      fetchCasesAndCounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Delete Entire Case Handler
  const handleDeleteCase = async (id) => {
    if (!window.confirm('Are you sure you want to delete this case and its entire document vault?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/firm/cases/${id}`);
      fetchCasesAndCounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete case');
    }
  };

  // Format party name
  const formatPartyName = (row) => {
    const ourParty = (!row.ourPartyName || /^[0-9a-fA-F-]{24,36}$/.test(row.ourPartyName))
      ? (row.client?.fullName || row.client?.companyOrAdvocate || '')
      : row.ourPartyName;
    const oppParty = row.oppPartyName || row.oppositePartyName || '';

    if (ourParty && oppParty) {
      return `${ourParty} vs. ${oppParty}`;
    }
    if (ourParty) return ourParty;
    if (oppParty) return `vs. ${oppParty}`;
    return row.caseTitle || '—';
  };

  // Prepare table rows
  const tableRows = useMemo(() => {
    return cases.map((c) => {
      const cid = (c.id || c._id).toString();
      const count = docCounts[cid] || 0;
      const lastUpload = lastUploadDates[cid] || null;
      return {
        ...c,
        id: cid,
        partyName: formatPartyName(c),
        clientName: c.client?.fullName || c.client?.companyOrAdvocate || '—',
        docCount: count,
        lastUploadedAt: lastUpload,
      };
    });
  }, [cases, docCounts, lastUploadDates]);

  // Filtered documents inside View Modal
  const filteredModalDocs = useMemo(() => {
    return caseDocs.filter((d) => {
      const matchesCat = !modalCatFilter || d.category === modalCatFilter;
      const matchesSearch = !modalDocSearch || d.fileName?.toLowerCase().includes(modalDocSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [caseDocs, modalCatFilter, modalDocSearch]);

  // Table Columns: Case Number, Party Name, Client, Upload Date, Upload, Action
  const columns = [
    {
      id: 'caseNumber',
      label: 'Case Number',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '0.84rem',
            letterSpacing: '0.02em',
          }}
        >
          {row.caseNumber}
        </Typography>
      ),
    },
    {
      id: 'partyName',
      label: 'Party Name',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '0.84rem',
            color: 'text.primary',
            maxWidth: 280,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {row.partyName}
        </Typography>
      ),
    },
    {
      id: 'client',
      label: 'Client',
      render: (row) => (
        <Typography sx={{ fontSize: '0.84rem', color: 'text.secondary' }}>
          {row.clientName}
        </Typography>
      ),
    },
    {
      id: 'lastUploadedAt',
      label: 'Upload Date',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: row.lastUploadedAt ? 'text.primary' : 'text.secondary' }}>
          {row.lastUploadedAt ? new Date(row.lastUploadedAt).toLocaleDateString() : '—'}
        </Typography>
      ),
    },
    {
      id: 'upload',
      label: 'Upload',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudUploadIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenUpload(row);
            }}
            sx={{
              height: 28,
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'none',
              px: 1.5,
              borderColor: 'rgba(212, 175, 55, 0.4)',
              color: '#D4AF37',
              '&:hover': {
                borderColor: '#D4AF37',
                bgcolor: 'rgba(212, 175, 55, 0.08)',
              },
            }}
          >
            Upload
          </Button>
          {row.docCount > 0 && (
            <Chip
              label={`${row.docCount} file${row.docCount > 1 ? 's' : ''}`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
              }}
            />
          )}
        </Box>
      ),
    },
  ];

  if (loading) return <LoadingScreen message="Loading Case Document Vault..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Case Document Vault"
        columns={columns}
        rows={tableRows}
        searchPlaceholder="Search by case number, party name, client..."
        searchField="partyName"
        onRowClick={(row) => handleOpenViewDialog(row)}
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title="View Documents">
              <IconButton
                size="small"
                color="info"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenViewDialog(row);
                }}
                sx={{
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: 1,
                  p: 0.6,
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit / Manage Documents">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenViewDialog(row);
                }}
                sx={{
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 1,
                  p: 0.6,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

      {/* VIEW / MANAGE CASE DOCUMENTS MODAL */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Chip
                label={`Case No: ${selectedCase?.caseNumber || ''}`}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label={selectedCase?.caseType || ''}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {selectedCase ? formatPartyName(selectedCase) : 'Case Documents'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Client: <b>{selectedCase?.client?.fullName || 'N/A'}</b> • Advocate: <b>{selectedCase?.advocate?.fullName || 'Assigned Counsel'}</b>
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<CloudUploadIcon />}
              onClick={() => {
                if (selectedCase) handleOpenUpload(selectedCase);
              }}
              sx={{
                bgcolor: '#C59B27',
                color: '#000000',
                fontWeight: 800,
                height: 32,
                '&:hover': { bgcolor: '#D4AF37' },
              }}
            >
              Upload Document
            </Button>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 2.5 }}>
          {/* Search & Category Filter */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search file name..."
              value={modalDocSearch}
              onChange={(e) => setModalDocSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 240 }, '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
            />

            <TextField
              select
              size="small"
              value={modalCatFilter}
              onChange={(e) => setModalCatFilter(e.target.value)}
              sx={{ width: { xs: '100%', sm: 180 }, '& .MuiInputBase-root': { height: 34, fontSize: '0.82rem' } }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontWeight: 600 }}>
              {filteredModalDocs.length} of {caseDocs.length} files
            </Typography>
          </Box>

          {/* Files Table inside View/Manage Modal */}
          {loadingDocs ? (
            <LoadingScreen message="Fetching case files..." />
          ) : filteredModalDocs.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 2, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <InsertDriveFileIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                {caseDocs.length === 0
                  ? 'No documents have been uploaded to this case vault yet.'
                  : 'No documents match your filter criteria.'}
              </Typography>
              {caseDocs.length === 0 && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    if (selectedCase) handleOpenUpload(selectedCase);
                  }}
                  sx={{ mt: 2, fontWeight: 700 }}
                >
                  Upload First File
                </Button>
              )}
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>File Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Uploaded Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Uploaded By</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredModalDocs.map((doc) => (
                    <TableRow key={doc.id} hover>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <InsertDriveFileIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          <span style={{ wordBreak: 'break-all' }}>{doc.fileName}</span>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={doc.category} size="small" color="primary" sx={{ fontWeight: 600, height: 22, fontSize: '0.72rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                        {doc.user?.fullName || doc.user?.email || 'System User'}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setPreviewDoc(doc);
                                setPreviewOpen(true);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Document">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleOpenEditDoc(doc)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleDownloadDoc(doc)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDoc(doc.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5 }}>
          <Button onClick={() => setViewDialogOpen(false)} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* EDIT DOCUMENT DIALOG */}
      <Dialog open={editDocOpen} onClose={() => setEditDocOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Edit Document Details
        </DialogTitle>
        <form onSubmit={handleEditDocSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}

            <TextField
              fullWidth
              label="Document Name"
              value={editFileName}
              onChange={(e) => setEditFileName(e.target.value)}
              sx={{ mb: 2.5 }}
              size="small"
              required
            />

            <TextField
              select
              fullWidth
              label="Document Category"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              sx={{ mb: 2.5 }}
              size="small"
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Replace File (Optional):
              </Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ py: 1, borderStyle: 'dashed', fontSize: '0.8rem' }}
              >
                {editReplacementFile ? editReplacementFile.name : 'Choose Replacement File...'}
                <input
                  type="file"
                  hidden
                  onChange={(e) => setEditReplacementFile(e.target.files[0])}
                />
              </Button>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditDocOpen(false)} color="inherit" disabled={editing}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={editing}>
              {editing ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* UPLOAD DOCUMENT DIALOG */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Upload Case Document
        </DialogTitle>
        <form onSubmit={handleUploadSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                Target Case: <b>{uploadTargetCase?.partyName || formatPartyName(uploadTargetCase || {})} ({uploadTargetCase?.caseNumber})</b>
              </Typography>
            </Box>

            <TextField
              select
              fullWidth
              label="Document Category"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              sx={{ mb: 2.5 }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUploadIcon />}
              sx={{ py: 1.5, borderStyle: 'dashed' }}
            >
              {uploadFile ? uploadFile.name : 'Choose File to Attach...'}
              <input
                type="file"
                hidden
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </Button>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setUploadOpen(false)} color="inherit" disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DOCUMENT PREVIEW MODAL */}
      <DocumentPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        document={previewDoc}
      />
    </Box>
  );
};

export default Documents;
