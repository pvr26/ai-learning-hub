import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Box,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';

const GitHubCard = ({ repo }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Chip
          icon={<GitHubIcon />}
          label="GitHub Repository"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Typography gutterBottom variant="h6" component="h2">
          {repo.full_name}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {repo.language || 'No language'} • {repo.stars} stars
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {repo.description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => window.open(repo.url, '_blank')}
          startIcon={<GitHubIcon />}
        >
          View Repository
        </Button>
        <Button
          size="small"
          color="primary"
          startIcon={<StarIcon />}
          disabled
        >
          {repo.stars}
        </Button>
      </CardActions>
    </Card>
  );
};

const GitHub = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    const fetchTrendingRepos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/search/github/trending');
        setRepositories(response.data.items || []);
      } catch (err) {
        console.error('Error fetching trending repositories:', err);
        setError('Failed to fetch trending repositories');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingRepos();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Trending AI Repositories
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Top AI-related repositories from the last 7 days
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      ) : repositories.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No trending repositories found.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {repositories.map((repo) => (
            <Grid item xs={12} sm={6} md={4} key={repo.id}>
              <GitHubCard repo={repo} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default GitHub; 