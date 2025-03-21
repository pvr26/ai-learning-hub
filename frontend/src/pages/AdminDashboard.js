import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Link,
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingResources, setPendingResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/resources/pending');
      setPendingResources(response.data.resources);
    } catch (error) {
      console.error('Error fetching pending resources:', error);
      setError('Failed to load pending resources');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (resource, type) => {
    setSelectedResource(resource);
    setActionType(type);
    setDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    try {
      if (actionType === 'approve') {
        await axios.put(`/api/resources/${selectedResource.id}`, {
          ...selectedResource,
          is_approved: true
        });
      } else {
        await axios.delete(`/api/resources/${selectedResource.id}`);
      }
      
      // Refresh the list
      fetchPendingResources();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error processing resource:', error);
      setError(`Failed to ${actionType} resource`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Pending Resources
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pendingResources.length === 0 ? (
          <Alert severity="info">No pending resources to review.</Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Submitter</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>{resource.title}</TableCell>
                    <TableCell>{resource.category}</TableCell>
                    <TableCell>{resource.submitter || 'Anonymous'}</TableCell>
                    <TableCell>
                      <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ display: 'flex', alignItems: 'center' }}
                      >
                        Visit <OpenInNewIcon sx={{ ml: 0.5, fontSize: 16 }} />
                      </Link>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="success"
                        onClick={() => handleAction(resource, 'approve')}
                        title="Approve"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleAction(resource, 'reject')}
                        title="Reject"
                      >
                        <CloseIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'approve' ? 'Approve Resource' : 'Reject Resource'}
        </DialogTitle>
        <DialogContent>
          Are you sure you want to {actionType} "{selectedResource?.title}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 