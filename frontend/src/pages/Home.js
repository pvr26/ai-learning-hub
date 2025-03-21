import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const ResourceCard = ({ resource, onBookmark, isBookmarked }) => {
  const navigate = useNavigate();

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

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const categories = [
    'Online courses',
    'Documentation',
    'Github',
    'Research papers',
    'Blogs & Forums'
  ];

  useEffect(() => {
    fetchResources();
    if (user) {
      fetchBookmarks();
    }
  }, [user, page, selectedCategory]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/resources', {
        params: {
          page: page,
          per_page: 20,
          category: selectedCategory || undefined
        }
      });
      setResources(response.data.resources);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get('/api/bookmarks');
      const bookmarkIds = new Set(response.data.bookmarks.map(b => b.resource.id));
      setBookmarks(bookmarkIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleBookmark = async (resource) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (bookmarks.has(resource.id)) {
        await axios.delete(`/api/bookmarks/${resource.id}`);
        setBookmarks(prev => {
          const newBookmarks = new Set(prev);
          newBookmarks.delete(resource.id);
          return newBookmarks;
        });
      } else {
        await axios.post('/api/bookmarks', { resource_id: resource.id });
        setBookmarks(prev => new Set([...prev, resource.id]));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPage(1); // Reset to first page when category changes
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          AI Learning Resources
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="category-filter-label">Filter by Category</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={selectedCategory}
            label="Filter by Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : resources.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No resources found in {selectedCategory || 'any category'}. Be the first to add one!
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {resources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <ResourceCard
                  resource={resource}
                  onBookmark={handleBookmark}
                  isBookmarked={bookmarks.has(resource.id)}
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
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Home; 