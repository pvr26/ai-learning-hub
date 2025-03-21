import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Pagination,
  Alert,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const ResourceCard = ({ resource, onBookmark, isBookmarked }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {resource.title}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {resource.category}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {resource.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => window.open(resource.url, '_blank')}
        >
          Visit Resource
        </Button>
        <Button
          size="small"
          color="primary"
          onClick={() => onBookmark(resource)}
          startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
        >
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </Button>
      </CardActions>
    </Card>
  );
};

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBookmarks();
  }, [page]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/bookmarks', {
        params: {
          page,
          per_page: 12,
        },
      });
      setBookmarks(response.data.bookmarks);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setError('Failed to load bookmarks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (resource) => {
    try {
      await axios.delete(`/api/bookmarks/${resource.id}`);
      setBookmarks(prev => prev.filter(b => b.resource.id !== resource.id));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      setError('Failed to remove bookmark. Please try again.');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
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
      <Typography variant="h4" component="h1" gutterBottom>
        My Bookmarks
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {bookmarks.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography variant="h6" color="text.secondary">
            You haven't bookmarked any resources yet.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {bookmarks.map((bookmark) => (
              <Grid item key={bookmark.id} xs={12} sm={6} md={4}>
                <ResourceCard
                  resource={bookmark.resource}
                  onBookmark={handleBookmark}
                  isBookmarked={true}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Bookmarks; 