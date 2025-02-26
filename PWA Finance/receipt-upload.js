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
    setPreview(null