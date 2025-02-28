import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress,
  IconButton,
  Grid,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// Custom styled components
const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 2,
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  cursor: 'pointer',
  transition: 'border-color 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

const HiddenInput = styled('input')({
  display: 'none',
});

const ReceiptUpload = ({ onUploadComplete, onError }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { currentUser } = useAuth();

  // Handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Create preview URL
      const previewURL = URL.createObjectURL(selectedFile);
      setPreview(previewURL);
    }
  };

  // Handle file upload to Firebase
  const handleUpload = async () => {
    if (!file || !currentUser) return;
    
    try {
      setUploading(true);
      
      // Generate a unique filename
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `users/${currentUser.uid}/receipts/${fileName}`);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const uploadProgress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(uploadProgress);
        },
        (error) => {
          // Handle upload error
          console.error('Upload error:', error);
          if (onError) onError('Failed to upload receipt. Please try again.');
          setUploading(false);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            if (onUploadComplete) {
              onUploadComplete({
                url: downloadURL,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
              });
            }
            
            // Reset state
            setProgress(0);
            setUploading(false);
          } catch (error) {
            console.error('Error getting download URL:', error);
            if (onError) onError('Failed to process uploaded receipt. Please try again.');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Upload error:', error);
      if (onError) onError('An unexpected error occurred. Please try again.');
      setUploading(false);
    }
  };

  // Clear selected file
  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setProgress(0);
  };

  // Open camera for mobile devices
  const handleCameraCapture = () => {
    // This function will trigger file input with camera as source
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const fileInput = document.getElementById('camera-input');
      if (fileInput) {
        fileInput.click();
      }
    } else {
      if (onError) onError('Camera access is not supported on this device or browser.');
    }
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Receipt
      </Typography>
      
      {!file ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <UploadBox
              component="label"
              htmlFor="receipt-upload"
              sx={{ height: 200, display: 'flex', justifyContent: 'center' }}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Drag & drop a receipt image or click to browse
              </Typography>
              <HiddenInput
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </UploadBox>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <UploadBox
              onClick={handleCameraCapture}
              sx={{ height: 200, display: 'flex', justifyContent: 'center' }}
            >
              <PhotoCameraIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" color="text.secondary">
                Take a photo of your receipt
              </Typography>
              <HiddenInput
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </UploadBox>
          </Grid>
        </Grid>
      ) : (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              {preview && (
                <Box
                  component="img"
                  src={preview}
                  alt="Receipt preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  File: {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  Upload Receipt
                </Button>
                <IconButton onClick={handleClear} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
              
              {uploading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress variant="determinate" value={progress} size={24} />
                  <Typography variant="body2" color="text.secondary">
                    {progress}% uploaded
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </Box>
      )}
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Supported formats: JPG, PNG, HEIC (iPhone) • Max size: 10MB
        </Typography>
      </Box>
    </Box>
  );
};

export default ReceiptUpload;
