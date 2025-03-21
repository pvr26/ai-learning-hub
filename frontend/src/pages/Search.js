import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Article as ArticleIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

const SearchResultCard = ({ result, isExternal, onBookmark, isBookmarked }) => {
  const getTitle = () => {
    if (!isExternal) return result.title;
    return result.type === 'github_repo' ? result.full_name : result.title;
  };

  const getTypeChip = () => {
    if (!isExternal) return null;
    
    if (result.type === 'github_repo') {
      return (
        <Chip
          icon={<GitHubIcon />}
          label="GitHub Repository"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1 }}
        />
      );
    } else if (result.type === 'research_paper') {
      return (
        <Chip
          icon={<ArticleIcon />}
          label="Research Paper"
          size="small"
          color="secondary"
          variant="outlined"
          sx={{ mb: 1 }}
        />
      );
    }
  };

  const getExtraInfo = () => {
    if (!isExternal) return result.category;
    
    if (result.type === 'github_repo') {
      return `${result.language || 'No language'} • ${result.stars} stars`;
    } else if (result.type === 'research_paper' && result.authors) {
      return `Authors: ${result.authors.join(', ')}`;
    }
    return '';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {isExternal && getTypeChip()}
        <Typography gutterBottom variant="h6" component="h2">
          {getTitle()}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {getExtraInfo()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {result.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => window.open(result.url, '_blank')}
        >
          Visit Resource
        </Button>
        {!isExternal && onBookmark && (
          <Button
            size="small"
            color="primary"
            onClick={() => onBookmark(result)}
            startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          >
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState({
    local: [],
    external: []
  });
  const [tabValue, setTabValue] = useState(0);
  const [bookmarks, setBookmarks] = useState(new Set());

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

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

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Search both local and external sources simultaneously
      const [localRes, githubRes, arxivRes] = await Promise.allSettled([
        axios.get(`/api/search?q=${encodeURIComponent(query)}`),
        axios.get(`/api/search/github?q=${encodeURIComponent(query)}`),
        axios.get(`/api/search/arxiv?q=${encodeURIComponent(query)}`)
      ]);

      const results = {
        local: [],
        external: []
      };

      // Handle local search results
      if (localRes.status === 'fulfilled') {
        results.local = localRes.value.data.resources;
      } else {
        console.error('Local search error:', localRes.reason);
      }

      // Handle GitHub results
      if (githubRes.status === 'fulfilled') {
        results.external = [...results.external, ...(githubRes.value.data.items || [])];
      } else {
        console.error('GitHub search error:', githubRes.reason);
        setError((prev) => prev ? `${prev}. GitHub: ${githubRes.reason.response?.data?.error || 'Search failed'}` : `GitHub: ${githubRes.reason.response?.data?.error || 'Search failed'}`);
      }

      // Handle arXiv results
      if (arxivRes.status === 'fulfilled') {
        results.external = [...results.external, ...(arxivRes.value.data.items || [])];
      } else {
        console.error('arXiv search error:', arxivRes.reason);
        setError((prev) => prev ? `${prev}. arXiv: Search failed` : 'arXiv: Search failed');
      }

      setResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search AI Resources
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for AI resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          Search
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label={`Local Results (${results.local.length})`} />
              <Tab label={`External Results (${results.external.length})`} />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {(tabValue === 0 ? results.local : results.external).map((result) => (
              <Grid item xs={12} sm={6} md={4} key={result.id}>
                <SearchResultCard
                  result={result}
                  isExternal={tabValue === 1}
                  onBookmark={tabValue === 0 ? handleBookmark : undefined}
                  isBookmarked={tabValue === 0 ? bookmarks.has(result.id) : false}
                />
              </Grid>
            ))}
          </Grid>

          {(tabValue === 0 ? results.local : results.external).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No results found. Try different search terms.
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default Search; 