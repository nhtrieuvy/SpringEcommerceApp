import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { endpoint, authApi } from '../configs/Apis';
import { useAuth } from '../configs/MyContexts';

// Định nghĩa các hàm API trực tiếp trong component
const getWishlistItems = async () => {
    try {
        const res = await authApi().get(endpoint.GET_WISHLIST);
        return res.data;
    } catch (error) {
        console.error('Error fetching wishlist items:', error);
        throw error;
    }
};

const addToWishlist = async (productId) => {
    try {
        const res = await authApi().post(endpoint.ADD_TO_WISHLIST, {
            productId: productId
        });
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        
        return res.data;
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        throw error;
    }
};

const removeFromWishlist = async (productId) => {
    try {
        const res = await authApi().delete(endpoint.REMOVE_FROM_WISHLIST(productId));
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('wishlistUpdated'));
        
        return true;
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        throw error;
    }
};

const isInWishlist = async (productId) => {
    try {
        const wishlistItems = await getWishlistItems();
        return wishlistItems.some(item => item.product.id === productId);
    } catch (error) {
        console.error('Error checking if product is in wishlist:', error);
        return false;
    }
};

const WishlistButton = ({ product, size = 'medium', showCounter = false, color = 'primary' }) => {
    const { isAuthenticated } = useAuth();
    const [isInWishlistState, setIsInWishlistState] = useState(false);
    const [wishlistCount, setWishlistCount] = useState(0);
    
    useEffect(() => {
        // Check if product is in wishlist and update wishlist count
        const checkWishlistStatus = async () => {
            if (!isAuthenticated || !product || !product.id) {
                setIsInWishlistState(false);
                setWishlistCount(0);
                return;
            }
            
            try {
                // Use direct API function to check wishlist status
                const inWishlist = await isInWishlist(product.id);
                setIsInWishlistState(inWishlist);
                
                // Get wishlist items to calculate count
                const wishlistItems = await getWishlistItems();
                setWishlistCount(wishlistItems.length);
            } catch (error) {
                console.error("Error checking wishlist status:", error);
                setIsInWishlistState(false);
            }
        };
        
        checkWishlistStatus();
        
        // Listen for wishlist updates
        const handleWishlistUpdate = async () => {
            await checkWishlistStatus();
        };
        
        window.addEventListener('wishlistUpdated', handleWishlistUpdate);
        
        return () => {
            window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
        };
    }, [product, isAuthenticated]);
    
    const handleToggleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated || !product || !product.id) return;
        
        try {
            if (isInWishlistState) {
                // Use direct API function
                await removeFromWishlist(product.id);
                setIsInWishlistState(false);
            } else {
                // Use direct API function
                await addToWishlist(product.id);
                setIsInWishlistState(true);
            }
            
            // Update wishlist count
            const wishlistItems = await getWishlistItems();
            setWishlistCount(wishlistItems.length);
        } catch (error) {
            console.error("Error toggling wishlist:", error);
        }
    };
    
    if (!product) return null;
    
    const buttonContent = (
        <IconButton
            color={color}
            size={size}
            onClick={handleToggleWishlist}
            aria-label={isInWishlistState ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
            {isInWishlistState ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
    );
    
    if (showCounter) {
        return (
            <Badge badgeContent={wishlistCount} color="error" overlap="circular">
                <Tooltip title={isInWishlistState ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}>
                    {buttonContent}
                </Tooltip>
            </Badge>
        );
    }
    
    return (
        <Tooltip title={isInWishlistState ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}>
            {buttonContent}
        </Tooltip>
    );
};

export default WishlistButton;
