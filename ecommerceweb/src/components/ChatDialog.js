import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    List,
    ListItem,
    Divider,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Person as PersonIcon,
    Storefront as StorefrontIcon
} from '@mui/icons-material';
import { MyUserContext } from '../configs/MyContexts';
import { sendMessage, subscribeToMessages, markConversationAsRead } from '../utils/chatUtils';

const ChatDialog = ({ open, onClose, conversation }) => {
    const [user] = useContext(MyUserContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);
    
    // Subscribe to messages when conversation changes
    useEffect(() => {
        let unsubscribe;
        
        if (open && conversation?.id && user?.id) {
            const initMessages = async () => {
                try {
                    setLoading(true);
                    setError('');

                    console.log('[ChatDialog] Subscribing to messages for conversation:', conversation.id);

                    // Subscribe to real-time updates
                    unsubscribe = await subscribeToMessages(conversation.id, (updatedMessages) => {
                        console.log('[ChatDialog] Messages updated:', updatedMessages);
                        setMessages(updatedMessages);
                    });

                    // Mark conversation as read
                    await markConversationAsRead(conversation.id, user.id);
                } catch (err) {
                    console.error('Error initializing messages:', err);
                    setError('Không thể tải tin nhắn. Vui lòng thử lại.');
                } finally {
                    setLoading(false);
                }
            };
            
            initMessages();
        }
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            setMessages([]);
            setError('');
        };
    }, [open, conversation?.id, user?.id]);
    
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversation || !user) return;

        try {
            const messageText = newMessage.trim();
            setNewMessage('');
            
            console.log('[ChatDialog] Sending message:', {
                conversationId: conversation.id,
                senderId: user.id,
                senderName: user.fullName || user.username,
                message: messageText
            });
            
            // Send message
            await sendMessage(
                conversation.id, 
                user.id, 
                user.fullName || user.username, 
                user.avatar, 
                messageText
            );
            
            console.log('[ChatDialog] Message sent successfully');
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Không thể gửi tin nhắn. Vui lòng thử lại.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const getOtherParticipant = () => {
        if (!conversation?.participants) return null;
        return conversation.participants.find(p => p.id !== user?.id);
    };

    const renderMessage = (message, index) => {
        const isCurrentUser = message.senderId === user?.id;
        
        return (
            <ListItem
                key={message.id || index}
                sx={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    px: 2,
                    py: 1
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        maxWidth: '70%'
                    }}
                >
                    <Avatar 
                        sx={{ 
                            width: 32, 
                            height: 32, 
                            mx: 1,
                            bgcolor: isCurrentUser ? 'primary.main' : 'grey.400'
                        }}
                    >
                        {isCurrentUser ? <PersonIcon fontSize="small" /> : <StorefrontIcon fontSize="small" />}
                    </Avatar>
                    
                    <Box
                        sx={{
                            bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
                            color: isCurrentUser ? 'white' : 'text.primary',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            position: 'relative'
                        }}
                    >
                        <Typography variant="body2">
                            {message.text}
                        </Typography>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                opacity: 0.7,
                                fontSize: '0.7rem',
                                display: 'block',
                                textAlign: 'right',
                                mt: 0.5
                            }}
                        >
                            {formatTime(message.timestamp)}
                        </Typography>
                    </Box>
                </Box>
            </ListItem>
        );
    };

    const otherParticipant = getOtherParticipant();

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{
                sx: { height: '80vh', maxHeight: '600px' }
            }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            <StorefrontIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" noWrap>
                                {otherParticipant?.name || 'Người bán'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Cuộc trò chuyện
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <Divider />
            
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Messages Area */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ m: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {!loading && messages.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body2" color="text.secondary">
                                Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                            </Typography>
                        </Box>
                    )}

                    <List sx={{ py: 0 }}>
                        {messages.map((message, index) => renderMessage(message, index))}
                        <div ref={messagesEndRef} />
                    </List>
                </Box>

                {/* Message Input */}
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={3}
                            placeholder="Nhập tin nhắn..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            variant="outlined"
                            size="small"
                            sx={{ borderRadius: 2 }}
                        />
                        <IconButton 
                            color="primary" 
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim() || loading}
                            sx={{ 
                                borderRadius: 2,
                                p: 1,
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': { bgcolor: 'primary.dark' },
                                '&.Mui-disabled': { bgcolor: 'grey.300' }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ChatDialog;
