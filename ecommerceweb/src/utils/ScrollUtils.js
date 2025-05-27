import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Hook để scroll về đầu trang khi chuyển route
export const useScrollToTop = () => {
    const location = useLocation();

    useEffect(() => {
        // Scroll về đầu trang với hiệu ứng mượt
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }, [location.pathname]); // Chạy khi pathname thay đổi
};

// Hook để quản lý trạng thái loading khi chuyển trang
export const usePageTransition = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        
        // Simulate loading time để đảm bảo content đã render
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 300); // 300ms loading time

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return isLoading;
};
