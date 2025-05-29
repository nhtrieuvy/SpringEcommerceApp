/**
 * Reports.js - Comprehensive JavaScript for Admin Reports & Statistics
 * Handles all chart rendering, data tables, and interactive features
 */

// Global variables for charts
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Reports page loaded');
    
    // Check if reportData is available
    if (typeof reportData === 'undefined') {
        console.error('Report data is not available');
        return;
    }
    
    console.log('Report data:', reportData);
    
    // Add a longer delay to ensure all external scripts including jQuery and DataTables are fully loaded
    setTimeout(function() {
        // Initialize all components
        initializeDataTables();
        initializeCharts();
        initializeEventHandlers();
        
        // Add responsive behavior
        window.addEventListener('resize', handleWindowResize);
    }, 500);
});

/**
 * Initialize all charts based on report type
 */
function initializeCharts() {
    // Check if Chart.js is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not available, skipping chart initialization');
        // Try to load Chart.js dynamically if not available
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = function() {
            console.log('Chart.js loaded dynamically');
            // Try again after Chart.js is loaded
            setTimeout(initializeCharts, 100);
        };
        document.head.appendChild(script);
        return;
    }
    
    const reportType = getCurrentReportType();
    
    console.log('Initializing charts for report type:', reportType);
    switch(reportType) {
        case 'sales':
            initializeSalesCharts();
            break;
        case 'sellers':
            initializeSellerCharts();
            break;
        default:
            console.log('Unknown report type, initializing default charts');
            initializeDefaultCharts();
    }
}

/**
 * Initialize Sales Report Charts
 */
function initializeSalesCharts() {
    console.log('Initializing sales charts');
    
    // Revenue over time chart
    createRevenueTimeChart();
    
    // Category revenue pie chart
    createCategoryRevenueChart();
    
    // Order status doughnut chart
    createOrderStatusChart();
    
    // Top products bar chart
    createTopProductsChart();
}

/**
 * Initialize Seller Report Charts
 */
function initializeSellerCharts() {
    console.log('Initializing seller charts');
    
    // Seller revenue bar chart
    createSellerRevenueChart();
    
    // Seller orders pie chart
    createSellerOrdersChart();
    
    // Top sellers horizontal bar chart
    createTopSellersChart();
    
    // Seller performance doughnut chart
    createSellerPerformanceChart();
}

/**
 * Empty placeholder functions for removed report types
 */
function initializeProductCharts() {
    console.log('Product charts have been removed');
}

function initializeCustomerCharts() {
    console.log('Customer charts have been removed');
}

function initializeInventoryCharts() {
    console.log('Inventory charts have been removed');
}

/**
 * Create Revenue Time Chart (Line Chart)
 */
function createRevenueTimeChart() {
    console.log('Creating revenue time chart...');
    console.log('revenueByPeriod data:', reportData.revenueByPeriod);
    
    const canvas = document.getElementById('revenueTimeChart');
    if (!canvas) {
        console.warn('Canvas element revenueTimeChart not found');
        return;
    }
    
    if (!reportData.revenueByPeriod) {
        console.warn('No revenueByPeriod data available');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for revenueTimeChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.revenueTimeChart) {
            charts.revenueTimeChart.destroy();
        }
        
        charts.revenueTimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: reportData.revenueByPeriod.labels || [],
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: reportData.revenueByPeriod.values || [],
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Xu hướng doanh thu theo thời gian',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Thời gian'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Doanh thu (VNĐ)'
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrencyShort(value);
                            }
                        }
                    }
                },            
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
        
        console.log('Revenue time chart created successfully');
    } catch (error) {
        console.error('Error creating revenue time chart:', error);
    }
}

/**
 * Create Category Revenue Chart (Pie Chart)
 */
function createCategoryRevenueChart() {
    console.log('Creating category revenue chart...');
    console.log('categoryRevenue data:', reportData.categoryRevenue);
    
    const canvas = document.getElementById('categoryRevenueChart');
    if (!canvas) {
        console.warn('Canvas element categoryRevenueChart not found');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for categoryRevenueChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.categoryRevenueChart) {
            charts.categoryRevenueChart.destroy();
        }
        
        let labels = [];
        let values = [];
        
        if (reportData.categoryRevenue) {
            if (reportData.categoryRevenue.labels && reportData.categoryRevenue.values) {
                labels = reportData.categoryRevenue.labels;
                values = reportData.categoryRevenue.values;
            } else if (Array.isArray(reportData.categoryRevenue)) {
                labels = reportData.categoryRevenue.map(item => item.name || item.categoryName || 'Unknown');
                values = reportData.categoryRevenue.map(item => item.percentage || item.revenue || 0);
            }
        } else {
            console.warn('No categoryRevenue data available');
        }
    
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
            '#4BC0C0', '#FF6384', '#36A2EB', '#FFCE56'
        ];
        
        charts.categoryRevenueChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverBorderWidth: 3,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Doanh thu theo danh mục sản phẩm',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = ((context.raw / values.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return context.label + ': ' + percentage + '%';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Category revenue chart created successfully');
    } catch (error) {
        console.error('Error creating category revenue chart:', error);
    }
}

/**
 * Create Order Status Chart (Doughnut Chart)
 */
function createOrderStatusChart() {
    console.log('Creating order status chart...');
    console.log('orderStatus data:', reportData.orderStatus);
    
    const canvas = document.getElementById('orderStatusChart');
    if (!canvas) {
        console.warn('Canvas element orderStatusChart not found');
        return;
    }
    
    if (!reportData.orderStatus) {
        console.warn('No orderStatus data available');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for orderStatusChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.orderStatusChart) {
            charts.orderStatusChart.destroy();
        }
        
        charts.orderStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: reportData.orderStatus.labels || [],
                datasets: [{
                    data: reportData.orderStatus.values || [],
                    backgroundColor: [
                        '#6C757D', // Chờ xác nhận - Gray
                        '#0D6EFD', // Đang xử lý - Blue
                        '#0DCAF0', // Đang giao hàng - Cyan
                        '#198754', // Đã hoàn thành - Green
                        '#DC3545'  // Đã hủy - Red
                    ],
                    borderWidth: 2,
                    borderColor: '#fff',
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Phân bố đơn hàng theo trạng thái',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Order status chart created successfully');
    } catch (error) {
        console.error('Error creating order status chart:', error);
    }
}

/**
 * Create Top Products Chart (Horizontal Bar Chart)
 */
function createTopProductsChart() {
    console.log('Creating top products chart...');
    console.log('topProducts data:', reportData.topProducts);
    console.log('topProductsChart data:', reportData.topProductsChart);
    
    const canvas = document.getElementById('topProductsChart');
    if (!canvas) {
        console.warn('Canvas element topProductsChart not found');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for topProductsChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.topProductsChart) {
            charts.topProductsChart.destroy();
        }
        
        let labels = [];
        let values = [];
        
        if (reportData.topProductsChart && reportData.topProductsChart.labels) {
            labels = reportData.topProductsChart.labels;
            values = reportData.topProductsChart.values;
        } else if (reportData.topProducts && Array.isArray(reportData.topProducts)) {
            labels = reportData.topProducts.slice(0, 5).map(product => 
                product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name
            );
            values = reportData.topProducts.slice(0, 5).map(product => product.quantitySold);
        }
        
        charts.topProductsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số lượng bán',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 5 sản phẩm bán chạy nhất',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Đã bán: ' + context.raw + ' sản phẩm';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Số lượng bán'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Sản phẩm'
                        }
                    }
                }
            }
        });
        
        console.log('Top products chart created successfully');
    } catch (error) {
        console.error('Error creating top products chart:', error);
    }
}

/**
 * Initialize DataTables for detailed tables
 */
function initializeDataTables() {
    console.log('Initializing DataTables');
    
    // Ensure jQuery is available through various possible names
    const jq = window.jQuery || window.$ || $;
    
    // Check if jQuery and DataTables are available
    if (typeof jq === 'undefined') {
        console.error('jQuery is not available, skipping DataTables initialization');
        return;
    }
    
    if (typeof jq.fn.DataTable === 'undefined') {
        console.error('DataTables is not available, skipping DataTables initialization');
        return;
    }
    
    // Destroy any existing DataTables first
    jq('.data-table').each(function() {
        if (jq.fn.DataTable.isDataTable(this)) {
            jq(this).DataTable().destroy();
        }
    });
    
    // Initialize all tables with data-table class
    try {
        jq('.data-table').each(function(tableIndex) {
            const table = jq(this);
            console.log('Initializing table ' + tableIndex);
            
            // Ensure the table has a thead
            if (table.find('thead').length === 0) {
                console.warn('Table ' + tableIndex + ' has no thead, skipping');
                return;
            }
            
            // Count columns in thead
            const headerCells = table.find('thead tr:first th');
            const columnCount = headerCells.length;
            console.log('Table ' + tableIndex + ' has ' + columnCount + ' columns in header');
            
            if (columnCount === 0) {
                console.warn('Table ' + tableIndex + ' has no columns, skipping');
                return;
            }
            
            // Fix tbody rows to ensure they have the right number of cells
            table.find('tbody tr').each(function(rowIndex) {
                const row = jq(this);
                
                // Skip rows with colspan attributes
                if (row.find('[colspan]').length > 0) {
                    console.log('Skipping row ' + rowIndex + ' with colspan');
                    return;
                }
                
                const cells = row.find('td');
                const cellCount = cells.length;
                
                if (cellCount !== columnCount) {
                    console.warn('Row ' + rowIndex + ' has ' + cellCount + ' cells but header has ' + columnCount + ' columns');
                    
                    // Add missing cells if needed
                    if (cellCount < columnCount) {
                        for (let i = cellCount; i < columnCount; i++) {
                            row.append('<td></td>');
                        }
                    }
                    // Remove extra cells if needed
                    else if (cellCount > columnCount) {
                        cells.slice(columnCount).remove();
                    }
                }
            });
            
            // Fix tfoot rows to ensure they have the right number of cells
            table.find('tfoot tr').each(function(rowIndex) {
                const row = jq(this);
                
                // Skip rows with colspan attributes
                if (row.find('[colspan]').length > 0) {
                    console.log('Skipping footer row ' + rowIndex + ' with colspan');
                    return;
                }
                
                const cells = row.find('td');
                const cellCount = cells.length;
                
                if (cellCount !== columnCount) {
                    console.warn('Footer row ' + rowIndex + ' has ' + cellCount + ' cells but header has ' + columnCount + ' columns');
                    
                    // Add missing cells if needed
                    if (cellCount < columnCount) {
                        for (let i = cellCount; i < columnCount; i++) {
                            row.append('<td></td>');
                        }
                    }
                    // Remove extra cells if needed
                    else if (cellCount > columnCount) {
                        cells.slice(columnCount).remove();
                    }
                }
            });
            
            // Initialize DataTable with options
            try {
                table.DataTable({
                    language: {
                        search: "Tìm kiếm:",
                        lengthMenu: "Hiển thị _MENU_ dòng",
                        info: "Hiển thị _START_ đến _END_ của _TOTAL_ dòng",
                        infoEmpty: "Hiển thị 0 đến 0 của 0 dòng",
                        infoFiltered: "(lọc từ _MAX_ dòng)",
                        paginate: {
                            first: "Đầu",
                            last: "Cuối",
                            next: "Tiếp",
                            previous: "Trước"
                        }
                    },
                    pageLength: 10,
                    responsive: true
                });
                console.log('Table ' + tableIndex + ' initialized successfully');
            } catch (tableError) {
                console.error('Error initializing table ' + tableIndex + ':', tableError);
            }
        });
        console.log('All DataTables initialized successfully');
    } catch (e) {
        console.error('Error during DataTables initialization:', e);
    }
}

/**
 * Initialize event handlers
 */
function initializeEventHandlers() {
    console.log('Initializing event handlers');
    
    // Print report button
    const printButton = document.getElementById('printReport');
    if (printButton) {
        printButton.addEventListener('click', printReport);
    }
    
    // Date range filter (enhanced UX)
    const reportType = document.getElementById('reportType');
    const periodType = document.getElementById('periodType');
    
    if (reportType) reportType.addEventListener('change', updateFilterOptions);
    if (periodType) periodType.addEventListener('change', updateDateRanges);
}

/**
 * Handle window resize for responsive charts
 */
function handleWindowResize() {
    console.log('Window resized, adjusting charts');
    
    // Resize all charts in the charts object
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            try {
                chart.resize();
            } catch (e) {
                console.error('Error resizing chart:', e);
            }
        }
    });
}

/**
 * Update filter options based on report type
 */
function updateFilterOptions() {
    // Implementation for filter option updates
}

/**
 * Update date ranges based on period type
 */
function updateDateRanges() {
    // Implementation for date range updates
}

/**
 * Print the current report
 */
function printReport() {
    console.log('Printing report...');
    window.print();
}

/**
 * Get current report type
 */
function getCurrentReportType() {
    const select = document.getElementById('reportType');
    return select ? select.value : 'sales';
}

/**
 * Format currency with full VNĐ
 */
function formatCurrency(value) {
    if (!value) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ';
}

/**
 * Format currency in short form (K, M, B)
 */
function formatCurrencyShort(value) {
    if (!value) return '0';
    
    if (value >= 1000000000) {
        return (value / 1000000000).toFixed(1) + 'B';
    } else if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
}

/**
 * Default chart initialization for unknown report types
 */
function initializeDefaultCharts() {
    console.log('Initializing default charts');
    createRevenueTimeChart();
    createCategoryRevenueChart();
    createOrderStatusChart();
    createTopProductsChart();
}

/**
 * Create Seller Revenue Chart (Bar Chart)
 */
function createSellerRevenueChart() {
    console.log('Creating seller revenue chart...');
    console.log('revenueBySeller data:', reportData.revenueBySeller);
    
    const canvas = document.getElementById('sellerRevenueChart');
    if (!canvas) {
        console.warn('Canvas element sellerRevenueChart not found');
        return;
    }
    
    if (!reportData.revenueBySeller || !Array.isArray(reportData.revenueBySeller)) {
        console.warn('No revenueBySeller data available or invalid format');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for sellerRevenueChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.sellerRevenueChart) {
            charts.sellerRevenueChart.destroy();
        }
        
        const labels = reportData.revenueBySeller.map(seller => seller.name);
        const values = reportData.revenueBySeller.map(seller => seller.revenue);
        
        charts.sellerRevenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.8)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Doanh thu theo người bán',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrencyShort(value);
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Seller revenue chart created successfully');
    } catch (error) {
        console.error('Error creating seller revenue chart:', error);
    }
}

/**
 * Create Seller Orders Chart (Pie Chart)
 */
function createSellerOrdersChart() {
    console.log('Creating seller orders chart...');
    console.log('ordersBySeller data:', reportData.ordersBySeller);
    
    const canvas = document.getElementById('sellerOrdersChart');
    if (!canvas) {
        console.warn('Canvas element sellerOrdersChart not found');
        return;
    }
    
    if (!reportData.ordersBySeller || !Array.isArray(reportData.ordersBySeller)) {
        console.warn('No ordersBySeller data available or invalid format');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for sellerOrdersChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.sellerOrdersChart) {
            charts.sellerOrdersChart.destroy();
        }
        
        const labels = reportData.ordersBySeller.map(seller => seller.name);
        const values = reportData.ordersBySeller.map(seller => seller.orderCount);
        
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
        
        charts.sellerOrdersChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Phân bố đơn hàng theo người bán',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return context.label + ': ' + context.raw + ' đơn (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Seller orders chart created successfully');
    } catch (error) {
        console.error('Error creating seller orders chart:', error);
    }
}

/**
 * Create Top Sellers Chart (Horizontal Bar Chart)
 */
function createTopSellersChart() {
    console.log('Creating top sellers chart...');
    console.log('topSellers data:', reportData.topSellers);
    
    const canvas = document.getElementById('topSellersChart');
    if (!canvas) {
        console.warn('Canvas element topSellersChart not found');
        return;
    }
    
    if (!reportData.topSellers || !Array.isArray(reportData.topSellers)) {
        console.warn('No topSellers data available or invalid format');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for topSellersChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.topSellersChart) {
            charts.topSellersChart.destroy();
        }
        
        const labels = reportData.topSellers.map(seller => seller.name);
        const values = reportData.topSellers.map(seller => seller.revenue);
        
        charts.topSellersChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: values,
                    backgroundColor: 'rgba(255, 206, 86, 0.8)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top người bán xuất sắc',
                        font: { size: 16, weight: 'bold' }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Doanh thu: ' + formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrencyShort(value);
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Top sellers chart created successfully');
    } catch (error) {
        console.error('Error creating top sellers chart:', error);
    }
}

/**
 * Create Seller Performance Chart (Doughnut Chart)
 */
function createSellerPerformanceChart() {
    console.log('Creating seller performance chart...');
    console.log('activeSellers:', reportData.activeSellers, 'totalSellers:', reportData.totalSellers);
    
    const canvas = document.getElementById('sellerPerformanceChart');
    if (!canvas) {
        console.warn('Canvas element sellerPerformanceChart not found');
        return;
    }
    
    try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Failed to get 2d context for sellerPerformanceChart');
            return;
        }
        
        // Destroy existing chart if it exists
        if (charts.sellerPerformanceChart) {
            charts.sellerPerformanceChart.destroy();
        }
        
        const activeSellers = reportData.activeSellers || 0;
        const totalSellers = reportData.totalSellers || 0;
        const inactiveSellers = totalSellers - activeSellers;
        
        charts.sellerPerformanceChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Người bán hoạt động', 'Người bán không hoạt động'],
                datasets: [{
                    data: [activeSellers, inactiveSellers],
                    backgroundColor: ['rgba(25, 135, 84, 0.8)', 'rgba(220, 53, 69, 0.8)'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Hiệu suất hoạt động người bán',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return context.label + ': ' + context.raw + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
        
        console.log('Seller performance chart created successfully');
    } catch (error) {
        console.error('Error creating seller performance chart:', error);
    }
}

/**
 * Low Stock Chart - Placeholder function
 * This function has been removed since inventory reports are no longer supported
 */
function createLowStockChart() {
    console.log('Low stock chart has been removed');
}

/**
 * Product Performance Chart - Placeholder function
 * This function has been removed since product reports are no longer supported
 */
function createProductPerformanceChart() {
    console.log('Product performance chart has been removed');
}

/**
 * Customer Activity Chart - Placeholder function
 * This function has been removed since customer reports are no longer supported
 */
function createCustomerActivityChart() {
    console.log('Customer activity chart has been removed');
}

/**
 * Customer Segment Chart - Placeholder function
 * This function has been removed since customer reports are no longer supported
 */
function createCustomerSegmentChart() {
    console.log('Customer segment chart has been removed');
}

/**
 * Customer Growth Chart - Placeholder function
 * This function has been removed since customer reports are no longer supported
 */
function createCustomerGrowthChart() {
    console.log('Customer growth chart has been removed');
}

/**
 * Top Customers Chart - Placeholder function
 * This function has been removed since customer reports are no longer supported
 */
function createTopCustomersChart() {
    console.log('Top customers chart has been removed');
}

/**
 * Inventory Value Chart - Placeholder function
 * This function has been removed since inventory reports are no longer supported
 */
function createInventoryValueChart() {
    console.log('Inventory value chart has been removed');
}

/**
 * Stock Level Chart - Placeholder function
 * This function has been removed since inventory reports are no longer supported
 */
function createStockLevelChart() {
    console.log('Stock level chart has been removed');
}

/**
 * Inventory Trend Chart - Placeholder function
 * This function has been removed since inventory reports are no longer supported
 */
function createInventoryTrendChart() {
    console.log('Inventory trend chart has been removed');
}

// Export functions for external use
window.reportsModule = {
    initializeCharts,
    formatCurrency,
    formatCurrencyShort,
    printReport,
    charts
};
