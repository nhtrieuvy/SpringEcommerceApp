import React from 'react';
import { Box } from '@mui/material';
import { useScrollToTop, usePageTransition } from '../utils/ScrollUtils';
import Loading from '../components/Loading';

const PageLayout = ({ children, loadingMessage = "Đang tải trang..." }) => {
    useScrollToTop(); // Tự động scroll về đầu trang khi chuyển route
    const isLoading = usePageTransition(); // Quản lý trạng thái loading

    return (
        <Box className="page-layout" sx={{ minHeight: '100vh', position: 'relative' }}>
            {isLoading ? (
                <Loading message={loadingMessage} />
            ) : (
                <Box 
                    className={`page-content ${isLoading ? 'loading' : ''}`}
                    sx={{ 
                        opacity: isLoading ? 0 : 1,
                        transition: 'opacity 0.3s ease-in-out',
                        minHeight: 'calc(100vh - 200px)' // Trừ đi chiều cao header và footer
                    }}
                >
                    {children}
                </Box>
            )}
        </Box>
    );
};

export default PageLayout;
