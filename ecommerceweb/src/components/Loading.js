import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';

const Loading = ({ message = "Đang tải...", backdrop = false, size = 40 }) => {
    const LoadingContent = () => (
        <Box 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                minHeight: backdrop ? '100vh' : '200px'
            }}
        >
            <CircularProgress size={size} color="primary" />
            <Typography variant="body1" color="text.secondary">
                {message}
            </Typography>
        </Box>
    );

    if (backdrop) {
        return (
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                open={true}
            >
                <LoadingContent />
            </Backdrop>
        );
    }

    return <LoadingContent />;
};

export default Loading;
