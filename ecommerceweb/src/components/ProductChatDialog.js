import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    IconButton,
    Avatar,
    Paper,
    Divider,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    Person as PersonIcon,
    Storefront as StorefrontIcon
} from '@mui/icons-material';
import { useAuth } from '../configs/MyContexts';
import { createOrGetConversation, sendMessage, subscribeToMessages } from '../utils/chatUtils';

const ProductChatDialog = ({ open, onClose, product, seller }) => {
    const { user, isAuthenticated } = useAuth();
    const [conversation, setConversation] = useState(null);
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
    
    // Initialize conversation when dialog opens
    useEffect(() => {
        let unsubscribe;
        
        if (open && isAuthenticated && seller?.id && user?.id) {
            const initConversation = async () => {
                try {
                    setLoading(true);
                    setError('');

                    console.log('[ProductChatDialog] Initializing conversation between:', user.id, 'and', seller.id);

                    // Create or get existing conversation with proper parameters
                    const conversationId = await createOrGetConversation(user.id, seller.id, seller.username || seller.storeName, seller.avatar);
                    setConversation({ id: conversationId }); // Convert to object format

                    console.log('[ProductChatDialog] Conversation ID:', conversationId);

                    // Subscribe to real-time updates with async handling
                    unsubscribe = await subscribeToMessages(conversationId, (updatedMessages) => {
                        console.log('[ProductChatDialog] Messages updated:', updatedMessages);
                        setMessages(updatedMessages);
                    });

                } catch (err) {
                    console.error('Error initializing conversation:', err);
                    setError('Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
                } finally {
                    setLoading(false);
                }
            };
            
            initConversation();
        }
        
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }            setConversation(null);
            setMessages([]);
            setError('');
        };
    }, [open, seller?.id, user?.id, isAuthenticated]);
    
    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversation || !user) return;

        try {
            const messageText = newMessage.trim();
            setNewMessage('');
            
            console.log('[ProductChatDialog] Sending message:', {
                conversationId: conversation.id,
                senderId: user.id,
                senderName: user.fullName || user.username,
                message: messageText
            });
            
            // Send message with proper parameters
            await sendMessage(
                conversation.id, 
                user.id, 
                user.fullName || user.username, 
                user.avatar, 
                messageText
            );
            
            console.log('[ProductChatDialog] Message sent successfully');
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

    const renderMessage = (message, index) => {
        const isCurrentUser = message.senderId === user?.id;
        
        return (
            <Box
                key={message.id || index}
                sx={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    mb: 1,
                    alignItems: 'flex-end'
                }}
            >
                {!isCurrentUser && (
                    <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                        <StorefrontIcon fontSize="small" />
                    </Avatar>
                )}
                
                <Box
                    sx={{
                        maxWidth: '70%',
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

                {isCurrentUser && (
                    <Avatar sx={{ width: 32, height: 32, ml: 1 }}>
                        <PersonIcon fontSize="small" />
                    </Avatar>
                )}
            </Box>
        );
    };

    if (!isAuthenticated) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="h6">Nhắn tin với người bán</Typography>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Alert severity="warning">
                        Vui lòng đăng nhập để nhắn tin với người bán.
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Đóng</Button>
                </DialogActions>
            </Dialog>
        );
    }

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
                        <Avatar sx={{ mr: 2 }}>
                            <StorefrontIcon />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" noWrap>
                                {seller?.storeName || seller?.username || 'Người bán'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Về sản phẩm: {product?.name}
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
                {/* Product Info */}
                <Paper sx={{ m: 2, p: 2, bgcolor: 'grey.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={product?.image || product?.images?.[0]}
                            alt={product?.name}
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 1,
                                objectFit: 'cover',
                                mr: 2
                            }}
                        />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" noWrap>
                                {product?.name}
                            </Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                {product?.price?.toLocaleString('vi-VN') || '0'}₫
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Messages Area */}
                <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
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

                    {messages.map((message, index) => renderMessage(message, index))}
                    <div ref={messagesEndRef} />
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

export default ProductChatDialog;
