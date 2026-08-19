import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Chip,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

import DataTable from '../../components/Common/DataTable.jsx';
import LoadingScreen from '../../components/Common/LoadingScreen.jsx';
import DocumentPreviewModal from '../../components/Common/DocumentPreviewModal.jsx';

const ClientDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('ALL');

  // Preview Modal (opened by clicking row)
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Upload Dialog
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCaseId, setUploadCaseId] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Evidence');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit Dialog
  const [editDocOpen, setEditDocOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editFileName, setEditFileName] = useState('');
  const [editCategory, setEditCategory] = useState('Evidence');
  const [editReplacementFile, setEditReplacementFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState('');

  // Snackbar Notification
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

  const fetchData = async () => {
    try {
      const [docsRes, casesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/firm/documents'),
        axios.get('http://localhost:5000/api/firm/cases?limit=200'),
      ]);

      const casesData = casesRes.data.cases || [];
      setDocuments(docsRes.data || []);
      setCases(casesData);

      if (casesData.length > 0 && !uploadCaseId) {
        setUploadCaseId((casesData[0].id || casesData[0]._id).toString());
      }
    } catch (err) {
      console.error('Error fetching client documents and cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenUpload = (targetCaseId) => {
    if (targetCaseId) {
      setUploadCaseId(targetCaseId.toString());
    } else if (cases.length > 0) {
      setUploadCaseId((cases[0].id || cases[0]._id).toString());
    }
    setUploadCategory('Evidence');
    setUploadFile(null);
    setUploadError('');
    setUploadOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('Please select a document file to upload');
      return;
    }

    if (!uploadCaseId) {
      setUploadError('Please select a target case file');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('caseId', uploadCaseId);
      formData.append('category', uploadCategory);
      formData.append('file', uploadFile);

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/firm/documents', formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSnackbar({ open: true, message: 'Document uploaded to vault successfully!', severity: 'success' });
      setUploadOpen(false);
      setUploadFile(null);
      fetchData();
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  // Open Document Edit Dialog
  const handleOpenEditDoc = (doc) => {
    setEditingDoc(doc);
    setEditFileName(doc.fileName || '');
    setEditCategory(doc.category || 'Evidence');
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

      setSnackbar({ open: true, message: 'Document updated successfully!', severity: 'success' });
      setEditDocOpen(false);
      setEditingDoc(null);
      setEditReplacementFile(null);
      fetchData();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update document');
    } finally {
      setEditing(false);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from your vault?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/firm/documents/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'info' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Format party name
  const formatPartyName = (c) => {
    if (!c) return '—';
    const ourParty = (!c.ourPartyName || /^[0-9a-fA-F-]{24,36}$/.test(c.ourPartyName))
      ? (c.client?.fullName || c.client?.companyOrAdvocate || '')
      : c.ourPartyName;
    const oppParty = c.oppPartyName || c.oppositePartyName || '';

    if (ourParty && oppParty) {
      return `${ourParty} vs. ${oppParty}`;
    }
    if (ourParty) return ourParty;
    if (oppParty) return `vs. ${oppParty}`;
    return c.caseTitle || '—';
  };

  // Filtered and prepared individual document rows
  const tableRows = useMemo(() => {
    return documents
      .filter((doc) => {
        // Case Filter
        if (caseFilter !== 'ALL') {
          const docCid = (doc.case?.id || doc.case?._id || doc.caseId?.id || doc.caseId?._id || doc.caseId || '').toString();
          if (docCid !== caseFilter) return false;
        }

        // Category Filter
        if (categoryFilter !== 'ALL') {
          if (doc.category !== categoryFilter) return false;
        }

        return true;
      })
      .map((doc) => {
        const cid = (doc.case?.id || doc.case?._id || doc.caseId?.id || doc.caseId?._id || doc.caseId || '').toString();
        const matchedCase = doc.case || (typeof doc.caseId === 'object' && doc.caseId !== null ? doc.caseId : null) || cases.find((c) => (c.id || c._id).toString() === cid) || {};
        
        const caseNumber = matchedCase.caseNumber || 'N/A';
        const partyName = formatPartyName(matchedCase);
        const uploadDate = doc.uploadedAt || doc.createdAt;

        return {
          ...doc,
          id: doc.id || doc._id,
          caseIdStr: cid,
          caseNumber,
          partyName,
          category: doc.category || 'General',
          uploadedAtFormatted: uploadDate ? new Date(uploadDate).toLocaleDateString() : '—',
          uploadedByFormatted: doc.user?.fullName || doc.user?.email || 'Legal Team',
        };
      });
  }, [documents, cases, categoryFilter, caseFilter]);

  // Table Columns for individual documents
  const columns = [
    {
      id: 'fileName',
      label: 'Document Name',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, maxWidth: 300 }}>
          <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: 20, flexShrink: 0 }} />
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.84rem',
              color: 'text.primary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.fileName || 'Untitled Document'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'caseNumber',
      label: 'Case Number',
      render: (row) => (
        <Typography
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            fontSize: '0.82rem',
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
            fontSize: '0.82rem',
            color: 'text.primary',
            maxWidth: 240,
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
      id: 'category',
      label: 'Category',
      render: (row) => (
        <Chip
          label={row.category}
          size="small"
          color="primary"
          sx={{
            fontWeight: 700,
            fontSize: '0.72rem',
            height: 22,
          }}
        />
      ),
    },
    {
      id: 'uploadedAtFormatted',
      label: 'Upload Date',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {row.uploadedAtFormatted}
        </Typography>
      ),
    },
    {
      id: 'uploadedByFormatted',
      label: 'Uploaded By',
      render: (row) => (
        <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>
          {row.uploadedByFormatted}
        </Typography>
      ),
    },
  ];

  if (loading) return <LoadingScreen message="Loading Document Vault..." />;

  return (
    <Box sx={{ py: 0.5 }}>
      <DataTable
        title="Document Vault"
        columns={columns}
        rows={tableRows}
        searchPlaceholder="Search document name, case number, party..."
        searchField="fileName"
        onRowClick={(row) => {
          setPreviewDoc(row);
          setPreviewOpen(true);
        }}
        headerAction={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
            {/* Filter by Case */}
            <TextField
              select
              size="small"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              sx={{
                width: { xs: '100%', sm: 180 },
                '& .MuiInputBase-root': { height: 34, fontSize: '0.8rem' },
              }}
            >
              <MenuItem value="ALL">All Cases</MenuItem>
              {cases.map((c) => {
                const cid = (c.id || c._id).toString();
                return (
                  <MenuItem key={cid} value={cid}>
                    {c.caseNumber} - {formatPartyName(c)}
                  </MenuItem>
                );
              })}
            </TextField>

            {/* Filter by Category */}
            <TextField
              select
              size="small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              sx={{
                width: { xs: '100%', sm: 150 },
                '& .MuiInputBase-root': { height: 34, fontSize: '0.8rem' },
              }}
            >
              <MenuItem value="ALL">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            {/* Upload Button */}
            <Button
              variant="contained"
              size="small"
              startIcon={<CloudUploadIcon />}
              onClick={() => handleOpenUpload()}
              sx={{
                bgcolor: '#C59B27',
                color: '#000000',
                fontWeight: 800,
                height: 34,
                px: 2,
                fontSize: '0.8rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#D4AF37' },
              }}
            >
              Upload Document
            </Button>
          </Box>
        }
        actions={(row) => (
          <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end', alignItems: 'center' }}>
            <Tooltip title="Edit Document">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditDoc(row);
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

            <Tooltip title="Download Document">
              <IconButton
                size="small"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadDoc(row);
                }}
                sx={{
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 1,
                  p: 0.6,
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete Document">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDoc(row.id || row._id);
                }}
                sx={{
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 1,
                  p: 0.6,
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      />

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
      <Dialog
        open={uploadOpen}
        onClose={() => !uploading && setUploadOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          Upload Document to Vault
          <IconButton onClick={() => setUploadOpen(false)} size="small" disabled={uploading}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleUploadSubmit}>
          <DialogContent sx={{ pt: 1 }}>
            {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

            <TextField
              select
              required
              fullWidth
              label="Select Case File"
              value={uploadCaseId}
              onChange={(e) => setUploadCaseId(e.target.value)}
              sx={{ mb: 2.5 }}
              size="small"
            >
              {cases.map((c) => {
                const cid = (c.id || c._id).toString();
                return (
                  <MenuItem key={cid} value={cid}>
                    {c.caseNumber} - {formatPartyName(c)}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              select
              required
              fullWidth
              label="Document Category"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              sx={{ mb: 2.5 }}
              size="small"
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
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </Button>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setUploadOpen(false)} color="inherit" disabled={uploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !uploadFile}
              sx={{
                bgcolor: '#C59B27',
                color: '#000000',
                fontWeight: 800,
                '&:hover': { bgcolor: '#D4AF37' },
              }}
            >
              {uploading ? 'Uploading...' : 'Upload to Vault'}
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

      {/* SNACKBAR NOTIFICATION */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', fontWeight: 700, borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientDocuments;
