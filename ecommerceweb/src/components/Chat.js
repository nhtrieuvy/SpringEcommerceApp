import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Badge,
  Divider,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Fab,
  useTheme,
  alpha
} from '@mui/material';
import {
  Send as SendIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useAuth } from '../configs/MyContexts';
import {
  createOrGetConversation,
  sendMessage,
  subscribeToMessages,
  subscribeToConversations,
  markConversationAsRead
} from '../utils/chatUtils';
import MessageBubble from './chat/MessageBubble';
import ConversationList from './chat/ConversationList';
import UserSearchDialog from './chat/UserSearchDialog';

const Chat = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const unsubscribeConversations = useRef(null);
  const unsubscribeMessages = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);  // Subscribe to user's conversations
  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      console.log('[Chat] Setting up conversation subscription for user:', user.id);
      
      // Handle async subscription setup
      const setupConversationSubscription = async () => {
        try {
          const unsubscribe = await subscribeToConversations(
            user.id.toString(),
            (conversationsData) => {
              console.log('[Chat] Received conversations update:', conversationsData.length, 'conversations');
              setConversations(conversationsData);
              setLoading(false);
            }
          );
          console.log('[Chat] Conversation subscription setup successfully');
          unsubscribeConversations.current = unsubscribe;
        } catch (error) {
          console.error('[Chat] Failed to setup conversation subscription:', error);
          setLoading(false);
        }
      };
      
      setupConversationSubscription();

      return () => {
        if (unsubscribeConversations.current) {
          console.log('[Chat] Cleaning up conversation subscription');
          unsubscribeConversations.current();
        }
      };
    }
  }, [user?.id]);  // Subscribe to messages of selected conversation
  useEffect(() => {
    if (selectedConversation) {
      console.log('[Chat] Setting up message subscription for conversation:', selectedConversation.id);
      
      // Handle async subscription setup
      const setupMessageSubscription = async () => {
        try {
          const unsubscribe = await subscribeToMessages(
            selectedConversation.id,
            (messagesData) => {
              console.log('[Chat] Received messages update:', messagesData.length, 'messages');
              setMessages(messagesData);
              // Mark conversation as read when viewing messages
              markConversationAsRead(selectedConversation.id, user.id.toString());
            }
          );
          console.log('[Chat] Message subscription setup successfully');
          unsubscribeMessages.current = unsubscribe;
        } catch (error) {
          console.error('[Chat] Failed to setup message subscription:', error);
          setMessages([]);
        }
      };
      
      setupMessageSubscription();

      return () => {
        if (unsubscribeMessages.current) {
          console.log('[Chat] Cleaning up message subscription');
          unsubscribeMessages.current();
        }
      };
    }
  }, [selectedConversation, user?.id]);
  // Handle sending new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      console.log('[Chat] Sending message to conversation:', selectedConversation.id);
      const messageText = newMessage.trim();
      setNewMessage(''); // Clear input before sending to improve UX
      
      await sendMessage(
        selectedConversation.id,
        user.id.toString(),
        user.fullname || user.username,
        user.avatar || '',
        messageText
      );
      console.log('[Chat] Message sent successfully');
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  // Start new conversation
  const handleStartConversation = async (otherUser) => {
    try {
      console.log('[Chat] Starting conversation with user:', otherUser.id);
      
      const conversationId = await createOrGetConversation(
        user.id.toString(),
        otherUser.id.toString(),
        otherUser.fullname || otherUser.username,
        otherUser.avatar || ''
      );
      
      console.log('[Chat] Conversation created/retrieved with ID:', conversationId);
      
      // Find the conversation in the list or wait for it to appear
      const existingConversation = conversations.find(conv => conv.id === conversationId);
      if (existingConversation) {
        console.log('[Chat] Found existing conversation in list');
        setSelectedConversation(existingConversation);
      } else {
        console.log('[Chat] Conversation not yet in list, it will appear via subscription');
        // Create a temporary conversation object
        const tempConversation = {
          id: conversationId,
          participants: [
            {
              id: user.id.toString(),
              lastSeen: new Date(),
              unreadCount: 0
            },
            {
              id: otherUser.id.toString(),
              name: otherUser.fullname || otherUser.username,
              avatar: otherUser.avatar || '',
              lastSeen: new Date(),
              unreadCount: 0
            }
          ],
          participantIds: [user.id.toString(), otherUser.id.toString()],
          createdAt: new Date()
        };
        setSelectedConversation(tempConversation);
      }
      
      setSearchDialogOpen(false);
      setChatOpen(true);
    } catch (error) {
      console.error('[Chat] Error starting conversation:', error);
    }
  };

  // Get other participant info
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
    return conversation.participants.find(p => p.id !== user.id.toString());
  };

  // Get unread count for current user
  const getUnreadCount = (conversation) => {
    if (!conversation || !conversation.participants) return 0;
    const currentUserParticipant = conversation.participants.find(p => p.id === user.id.toString());
    return currentUserParticipant?.unreadCount || 0;
  };

  // Format last message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return messageDate.toLocaleDateString('vi-VN');
  };

  if (!user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Vui lòng đăng nhập để sử dụng tính năng chat</Typography>
      </Box>
    );
  }

  // Mobile chat toggle
  const ChatToggle = () => (
    <Fab
      color="primary"
      aria-label="chat"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        display: { xs: 'flex', md: 'none' }
      }}
      onClick={() => setChatOpen(!chatOpen)}
    >
      <Badge badgeContent={conversations.reduce((total, conv) => total + getUnreadCount(conv), 0)} color="error">
        <ChatIcon />
      </Badge>
    </Fab>
  );

  return (
    <>
      {/* Mobile Chat Toggle */}
      <ChatToggle />

      {/* Mobile Chat Dialog */}
      <Dialog
        fullScreen
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            background: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">Chat</Typography>
            <IconButton color="inherit" onClick={() => setChatOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          {/* Chat Content */}
          <Box sx={{ flex: 1, display: 'flex' }}>
            <ChatContent />
          </Box>
        </Box>
      </Dialog>

      {/* Desktop Chat */}
      <Box sx={{ 
        display: { xs: 'none', md: 'flex' },
        height: 'calc(100vh - 100px)',
        p: 2
      }}>
        <ChatContent />
      </Box>

      {/* User Search Dialog */}
      <UserSearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        onSelectUser={handleStartConversation}
      />
    </>
  );

  // Main chat content component
  function ChatContent() {
    return (
      <>
        {/* Conversations List */}
        <Paper sx={{ 
          width: { xs: selectedConversation ? 0 : '100%', md: 350 },
          display: { xs: selectedConversation ? 'none' : 'block', md: 'block' },
          borderRadius: 2,
          overflow: 'hidden',
          mr: { md: 2 }
        }}>
          {/* Header */}
          <Box sx={{
            p: 2,
            background: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Typography variant="h6">Tin nhắn</Typography>
            <IconButton
              color="inherit"
              onClick={() => setSearchDialogOpen(true)}
              size="small"
            >
              <SearchIcon />
            </IconButton>
          </Box>

          {/* Conversations */}
          <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
            {loading ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Chưa có cuộc trò chuyện nào
                </Typography>
              </Box>
            ) : (
              <List>
                {conversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  const unreadCount = getUnreadCount(conversation);
                  
                  return (
                    <ListItem
                      key={conversation.id}
                      button
                      onClick={() => setSelectedConversation(conversation)}
                      selected={selectedConversation?.id === conversation.id}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge badgeContent={unreadCount} color="error">
                          <Avatar
                            src={otherParticipant?.avatar}
                            alt={otherParticipant?.name}
                          >
                            {otherParticipant?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={otherParticipant?.name || 'Unknown User'}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {conversation.lastMessage?.text || 'Bắt đầu cuộc trò chuyện'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatMessageTime(conversation.lastMessageTime)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </Box>
        </Paper>

        {/* Chat Area */}
        <Paper sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <Box sx={{
                p: 2,
                background: theme.palette.grey[50],
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    src={getOtherParticipant(selectedConversation)?.avatar}
                    alt={getOtherParticipant(selectedConversation)?.name}
                    sx={{ mr: 2 }}
                  >
                    {getOtherParticipant(selectedConversation)?.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography variant="h6">
                    {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                  </Typography>
                </Box>
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              </Box>

              {/* Messages Area */}
              <Box sx={{
                flex: 1,
                overflow: 'auto',
                p: 1,
                background: theme.palette.grey[50]
              }}>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === user.id.toString()}
                    user={user}
                  />
                ))}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input */}
              <Box sx={{
                p: 2,
                borderTop: `1px solid ${theme.palette.divider}`,
                background: 'white'
              }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          color="primary"
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
            </>
          ) : (
            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'text.secondary'
            }}>
              <ChatIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom>
                Chọn một cuộc trò chuyện để bắt đầu
              </Typography>
              <Typography variant="body2">
                Hoặc tìm kiếm người dùng để bắt đầu cuộc trò chuyện mới
              </Typography>
            </Box>
          )}
        </Paper>
      </>
    );
  }
};

export default Chat;
