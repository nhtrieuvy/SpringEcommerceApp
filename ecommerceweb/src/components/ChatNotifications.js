import React, { useState, useEffect, useContext } from 'react';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    ListItemAvatar,
    Avatar,
    Typography,
    Box,
    Divider,
    Button,
    Chip,
    MenuList
} from '@mui/material';
import {
    Chat as ChatIcon,
    Storefront as StorefrontIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { MyUserContext } from '../configs/MyContexts';
import { subscribeToConversations, markConversationAsRead } from '../utils/chatUtils';
import ChatDialog from './ChatDialog';

const ChatNotifications = () => {
    const [user] = useContext(MyUserContext);
    const [anchorEl, setAnchorEl] = useState(null);    const [conversations, setConversations] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [chatDialogOpen, setChatDialogOpen] = useState(false);

    // Subscribe to conversations when user is available
    useEffect(() => {
        let unsubscribe;

        if (user?.id) {
            console.log('[ChatNotifications] Setting up conversation subscription for user:', user.id);
            setLoading(true);

            const setupSubscription = async () => {
                try {
                    unsubscribe = await subscribeToConversations(user.id, (updatedConversations) => {
                        console.log('[ChatNotifications] Conversations updated:', updatedConversations);
                        setConversations(updatedConversations);
                        
                        // Calculate total unread count
                        const totalUnread = updatedConversations.reduce((total, conv) => {
                            const userParticipant = conv.participants?.find(p => p.id === user.id);
                            return total + (userParticipant?.unreadCount || 0);
                        }, 0);
                        
                        setTotalUnreadCount(totalUnread);
                        setLoading(false);
                    });
                } catch (error) {
                    console.error('[ChatNotifications] Error setting up subscription:', error);
                    setLoading(false);
                }
            };

            setupSubscription();
        } else {
            setConversations([]);
            setTotalUnreadCount(0);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [user?.id]);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };    const handleConversationClick = async (conversation) => {
        try {
            // Mark conversation as read
            await markConversationAsRead(conversation.id, user.id);
            
            // Open chat dialog
            setSelectedConversation(conversation);
            setChatDialogOpen(true);
            handleMenuClose();
            
            console.log('[ChatNotifications] Opening conversation:', conversation.id);
        } catch (error) {
            console.error('[ChatNotifications] Error opening conversation:', error);
        }
    };

    const handleCloseChatDialog = () => {
        setChatDialogOpen(false);
        setSelectedConversation(null);
    };

    const formatLastMessageTime = (timestamp) => {
        if (!timestamp) return '';
        
        try {
            const now = new Date();
            const messageTime = timestamp instanceof Date ? timestamp : new Date(timestamp);
            const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
            
            if (diffInMinutes < 1) return 'Vừa xong';
            if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) return `${diffInHours} giờ trước`;
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) return `${diffInDays} ngày trước`;
            
            return messageTime.toLocaleDateString('vi-VN');
        } catch (error) {
            console.error('Error formatting time:', error);
            return '';
        }
    };

    const getOtherParticipant = (conversation) => {
        if (!conversation.participants) return null;
        return conversation.participants.find(p => p.id !== user?.id);
    };

    const getUserUnreadCount = (conversation) => {
        if (!conversation.participants) return 0;
        const userParticipant = conversation.participants.find(p => p.id === user?.id);
        return userParticipant?.unreadCount || 0;
    };

    const truncateMessage = (message, maxLength = 50) => {
        if (!message) return '';
        return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
    };

    // Don't render if user is not logged in
    if (!user) {
        return null;
    }

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                    mr: 1,
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                }}
            >
                <Badge 
                    badgeContent={totalUnreadCount} 
                    color="error"
                    max={99}
                    sx={{
                        '& .MuiBadge-badge': {
                            fontSize: '0.75rem',
                            height: '18px',
                            minWidth: '18px'
                        }
                    }}
                >
                    <ChatIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                PaperProps={{
                    sx: {
                        width: 380,
                        maxHeight: 500,
                        mt: 1,
                        '& .MuiList-root': {
                            padding: 0
                        }
                    }
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'white' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Tin nhắn
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {totalUnreadCount > 0 
                            ? `${totalUnreadCount} tin nhắn chưa đọc`
                            : 'Không có tin nhắn mới'
                        }
                    </Typography>
                </Box>

                <Divider />

                {/* Conversations List */}
                {loading ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Đang tải...
                        </Typography>
                    </Box>
                ) : conversations.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <ChatIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            Chưa có cuộc trò chuyện nào
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Bắt đầu chat với người bán từ trang sản phẩm
                        </Typography>
                    </Box>
                ) : (
                    <MenuList sx={{ py: 0 }}>
                        {conversations.slice(0, 5).map((conversation) => {
                            const otherParticipant = getOtherParticipant(conversation);
                            const unreadCount = getUserUnreadCount(conversation);
                            const lastMessage = conversation.lastMessage;

                            return (
                                <MenuItem
                                    key={conversation.id}
                                    onClick={() => handleConversationClick(conversation)}
                                    sx={{
                                        py: 2,
                                        px: 2,
                                        alignItems: 'flex-start',
                                        backgroundColor: unreadCount > 0 ? 'action.hover' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'action.selected'
                                        }
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                                            <StorefrontIcon />
                                        </Avatar>
                                    </ListItemAvatar>
                                    
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography 
                                                variant="subtitle2" 
                                                sx={{ 
                                                    fontWeight: unreadCount > 0 ? 600 : 400,
                                                    color: unreadCount > 0 ? 'text.primary' : 'text.secondary'
                                                }}
                                                noWrap
                                            >
                                                {otherParticipant?.name || 'Người bán'}
                                            </Typography>
                                            
                                            {unreadCount > 0 && (
                                                <Chip
                                                    label={unreadCount}
                                                    size="small"
                                                    color="error"
                                                    sx={{ 
                                                        height: 20, 
                                                        fontSize: '0.75rem',
                                                        minWidth: 20
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        
                                        {lastMessage && (
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary" 
                                                sx={{ 
                                                    fontWeight: unreadCount > 0 ? 500 : 400,
                                                    mt: 0.5
                                                }}
                                                noWrap
                                            >
                                                {lastMessage.senderId === user.id ? 'Bạn: ' : ''}
                                                {truncateMessage(lastMessage.text)}
                                            </Typography>
                                        )}
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5, color: 'text.disabled' }} />
                                            <Typography variant="caption" color="text.disabled">
                                                {formatLastMessageTime(conversation.lastMessageTime)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </MenuItem>
                            );
                        })}
                    </MenuList>
                )}

                {conversations.length > 5 && (
                    <>
                        <Divider />
                        <Box sx={{ p: 1 }}>
                            <Button
                                fullWidth
                                variant="text"
                                size="small"
                                onClick={() => {
                                    handleMenuClose();
                                    // TODO: Navigate to full chat page
                                    console.log('Navigate to full chat page');
                                }}
                            >
                                Xem tất cả tin nhắn
                            </Button>
                        </Box>
                    </>
                )}            </Menu>

            {/* Chat Dialog */}
            <ChatDialog
                open={chatDialogOpen}
                onClose={handleCloseChatDialog}
                conversation={selectedConversation}
            />
        </>
    );
};

export default ChatNotifications;
