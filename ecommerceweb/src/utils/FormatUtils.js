/**
 * Format a numeric amount to Vietnamese currency format
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    // Handle null, undefined or NaN values
    if (amount === null || amount === undefined || isNaN(amount)) {
        return "0 đ";
    }
    
    // Format the number with thousand separators
    const formattedNumber = new Intl.NumberFormat('vi-VN', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
    
    // Return with proper đ symbol at the end with a space as shown in screenshots
    return `${formattedNumber} đ`;
};

/**
 * Format a date string to Vietnamese date format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

/**
 * Format a date string to Vietnamese time format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit', 
        second: '2-digit'
    });
};

/**
 * Format a date string to Vietnamese datetime format
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

// You can add more formatting utility functions here as needed