import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import axios from '../utils/axios';

const Message = ({ content, isUser }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      mb: 2,
    }}
  >
    <Paper
      elevation={1}
      sx={{
        p: 2,
        maxWidth: '70%',
        backgroundColor: isUser ? 'primary.main' : 'grey.100',
        color: isUser ? 'white' : 'text.primary',
      }}
    >
      <ReactMarkdown
        components={{
          // Style markdown elements
          p: ({ children }) => <Typography variant="body1" paragraph>{children}</Typography>,
          h1: ({ children }) => <Typography variant="h4" gutterBottom>{children}</Typography>,
          h2: ({ children }) => <Typography variant="h5" gutterBottom>{children}</Typography>,
          h3: ({ children }) => <Typography variant="h6" gutterBottom>{children}</Typography>,
          ul: ({ children }) => <Box component="ul" sx={{ pl: 2 }}>{children}</Box>,
          ol: ({ children }) => <Box component="ol" sx={{ pl: 2 }}>{children}</Box>,
          li: ({ children }) => <Box component="li" sx={{ mb: 1 }}>{children}</Box>,
          code: ({ children }) => (
            <Box
              component="code"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                p: 0.5,
                borderRadius: 1,
                fontFamily: 'monospace',
              }}
            >
              {children}
            </Box>
          ),
          pre: ({ children }) => (
            <Box
              component="pre"
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                fontFamily: 'monospace',
              }}
            >
              {children}
            </Box>
          ),
          blockquote: ({ children }) => (
            <Box
              component="blockquote"
              sx={{
                borderLeft: 4,
                borderColor: 'primary.main',
                pl: 2,
                my: 2,
                fontStyle: 'italic',
              }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Paper>
  </Box>
);

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { content: userMessage, isUser: true }]);
    setLoading(true);
    setError(null);

    try {
      // Convert messages to conversation history format
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await axios.post('/api/chat', {
        message: userMessage,
        conversation_history: conversationHistory
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      setMessages(prev => [...prev, { content: response.data.reply, isUser: false }]);
    } catch (err) {
      setError('Failed to get response from AI. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" component="h1">
            AI Chat Assistant
          </Typography>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {messages.map((message, index) => (
            <Message key={index} content={message.content} isUser={message.isUser} />
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <CircularProgress size={20} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            gap: 1,
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !input.trim()}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AIChat; 