import React, { useState, useEffect } from 'react';
import { Box, Skeleton, Container } from '@mui/material';

// Component wrapper cho các trang cần loading data
const AsyncPageWrapper = ({ 
    children, 
    isLoading = false, 
    loadingComponent = null,
    minLoadingTime = 300 // Thời gian loading tối thiểu để tránh nhấp nháy
}) => {
    const [showLoading, setShowLoading] = useState(isLoading);

    useEffect(() => {
        if (isLoading) {
            setShowLoading(true);
        } else {
            // Đảm bảo loading hiển thị ít nhất minLoadingTime ms
            const timer = setTimeout(() => {
                setShowLoading(false);
            }, minLoadingTime);

            return () => clearTimeout(timer);
        }
    }, [isLoading, minLoadingTime]);

    // Component loading mặc định
    const defaultLoadingComponent = (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2, mb: 2 }} />
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" height={30} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
            </Box>
            <Box>
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={30} />
            </Box>
        </Container>
    );

    if (showLoading) {
        return loadingComponent || defaultLoadingComponent;
    }

    return (
        <Box 
            sx={{ 
                opacity: showLoading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
            }}
        >
            {children}
        </Box>
    );
};

export default AsyncPageWrapper;
