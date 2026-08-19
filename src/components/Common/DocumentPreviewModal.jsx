import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';

import { API_BASE_URL } from '../../config/api';

const getCleanFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const clean = url.replace(/\\/g, '/');
  const pathStr = clean.startsWith('/') ? clean : '/' + clean;
  return `${API_BASE_URL}${pathStr}`;
};

export const DocumentPreviewModal = ({ open, onClose, document: docItem }) => {
  if (!docItem) return null;

  const fileName = docItem.fileName || 'document.pdf';
  const fullUrl = getCleanFileUrl(docItem.fileUrl);
  const docId = docItem.id || docItem._id;

  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(docItem.fileUrl || '');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [blobUrl, setBlobUrl] = useState('');
  const [isImageFile, setIsImageFile] = useState(isImage);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Clean up Object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const loadOriginalDocument = async () => {
    setLoading(true);
    setError(false);
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. FIRST PRIORITY: JSON Preview Data endpoint (Immunized against IDM interception)
    if (docId) {
      try {
        const jsonUrl = `${API_BASE_URL}/api/firm/documents/${docId}/preview-data`;
        const res = await axios.get(jsonUrl, { headers });
        if (res.data && res.data.base64) {
          const mimeType = res.data.mimeType || (isImage ? 'image/jpeg' : 'application/pdf');
          const isImg = mimeType.startsWith('image/') || isImage;
          setIsImageFile(isImg);

          const binaryString = window.atob(res.data.base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const fileBlob = new Blob([bytes], { type: mimeType });
          const newBlobUrl = URL.createObjectURL(fileBlob);
          setBlobUrl(newBlobUrl);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('JSON preview-data API request fallback:', e.message);
      }
    }

    // 2. SECOND PRIORITY: Direct file blob stream
    if (docId) {
      try {
        const streamUrl = `${API_BASE_URL}/api/firm/documents/${docId}/file`;
        const res = await axios.get(streamUrl, {
          headers,
          responseType: 'blob',
        });
        if (res.data && res.data.size > 0) {
          const detectedType = res.headers['content-type'] || (isImage ? 'image/jpeg' : 'application/pdf');
          const isImg = detectedType.startsWith('image/') || isImage;
          setIsImageFile(isImg);

          const fileBlob = new Blob([res.data], { type: detectedType });
          const newBlobUrl = URL.createObjectURL(fileBlob);
          setBlobUrl(newBlobUrl);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('API file stream fallback:', e.message);
      }
    }

    // 3. THIRD PRIORITY: Direct static URL blob
    if (fullUrl) {
      try {
        const res = await axios.get(fullUrl, { responseType: 'blob' });
        if (res.data && res.data.size > 0) {
          const detectedType = res.headers['content-type'] || (isImage ? 'image/jpeg' : 'application/pdf');
          const isImg = detectedType.startsWith('image/') || isImage;
          setIsImageFile(isImg);

          const fileBlob = new Blob([res.data], { type: detectedType });
          const newBlobUrl = URL.createObjectURL(fileBlob);
          setBlobUrl(newBlobUrl);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Static file fetch fallback:', e.message);
      }
    }

    // 4. FOURTH PRIORITY: Direct URL
    if (fullUrl) {
      setIsImageFile(isImage);
      setBlobUrl(fullUrl);
      setLoading(false);
      return;
    }

    setError(true);
    setLoading(false);
  };

  useEffect(() => {
    if (open && docItem) {
      loadOriginalDocument();
    }
  }, [open, docItem]);

  const handleDownload = () => {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 100);
    } else {
      const token = localStorage.getItem('token');
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
      const targetUrl = docId
        ? `${API_BASE_URL}/api/firm/documents/${docId}/file${tokenParam}`
        : fullUrl;
      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) document.body.removeChild(link);
      }, 100);
    }
  };

  const handleOpenNewTab = () => {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
    } else {
      const token = localStorage.getItem('token');
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
      const targetUrl = docId
        ? `${API_BASE_URL}/api/firm/documents/${docId}/file${tokenParam}`
        : fullUrl;
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isFullScreen}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: isFullScreen ? 0 : 2.5,
          bgcolor: '#0f172a',
          color: '#ffffff',
          backgroundImage: 'none',
          boxShadow: 24,
          width: isFullScreen ? '100vw' : { xs: '98vw', md: '95vw', lg: '92vw' },
          maxWidth: isFullScreen ? '100vw' : '1550px',
          height: isFullScreen ? '100vh' : '94vh',
          maxHeight: isFullScreen ? '100vh' : '95vh',
          display: 'flex',
          flexDirection: 'column',
          m: isFullScreen ? 0 : 'auto',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.25,
          px: 2.5,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', pr: 2 }}>
          <InsertDriveFileIcon sx={{ color: '#38BDF8', fontSize: 30 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.05rem', wordBreak: 'break-all', color: '#ffffff' }}>
              {fileName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
              {docItem.category && (
                <Chip
                  label={docItem.category}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    bgcolor: 'rgba(56, 189, 248, 0.2)',
                    color: '#38BDF8',
                  }}
                />
              )}
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {docItem.uploadedAt ? `Uploaded: ${new Date(docItem.uploadedAt).toLocaleDateString()}` : 'Original Format'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Download Original File">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              sx={{
                borderColor: 'rgba(255,255,255,0.25)',
                color: '#ffffff',
                height: 32,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#ffffff',
                  bgcolor: 'rgba(255,255,255,0.08)',
                },
              }}
            >
              Download
            </Button>
          </Tooltip>

          <Tooltip title="Open in Separate Tab">
            <Button
              variant="contained"
              size="small"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpenNewTab}
              sx={{
                bgcolor: '#38BDF8',
                color: '#0f172a',
                height: 32,
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: '#7dd3fc',
                },
              }}
            >
              Open in Tab
            </Button>
          </Tooltip>

          <Tooltip title={isFullScreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}>
            <IconButton
              onClick={() => setIsFullScreen(!isFullScreen)}
              size="small"
              sx={{ color: '#38BDF8', bgcolor: 'rgba(56, 189, 248, 0.1)', '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.2)' } }}
            >
              {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>

          <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255, 255, 255, 0.7)', ml: 0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <DialogContent
        sx={{
          p: 0,
          flexGrow: 1,
          bgcolor: '#020617',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={44} sx={{ color: '#38BDF8', mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 }}>
              Rendering original document preview...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <InsertDriveFileIcon sx={{ fontSize: 56, color: '#94a3b8' }} />
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
              Document Ready
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: 440 }}>
              Click below to view or download the document in its exact original formatting.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadOriginalDocument}
                sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
              >
                Retry
              </Button>
              <Button
                variant="contained"
                startIcon={<OpenInNewIcon />}
                onClick={handleOpenNewTab}
                sx={{ bgcolor: '#38BDF8', color: '#0f172a', fontWeight: 700 }}
              >
                Open in Separate Tab
              </Button>
            </Box>
          </Box>
        ) : isImageFile ? (
          <Box
            component="img"
            src={blobUrl || fullUrl}
            alt={fileName}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              p: 2,
            }}
          />
        ) : (
          <Box sx={{ width: '100%', height: '100%', bgcolor: '#ffffff' }}>
            <iframe
              src={blobUrl || fullUrl}
              title={fileName}
              width="100%"
              height="100%"
              style={{
                border: 'none',
                width: '100%',
                height: '100%',
                display: 'block',
              }}
            />
          </Box>
        )}
      </DialogContent>

      {/* FOOTER */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(30, 41, 59, 0.85)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          Native Browser PDF Engine • Original Document
        </Typography>
        <Button variant="outlined" onClick={onClose} size="small" sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
