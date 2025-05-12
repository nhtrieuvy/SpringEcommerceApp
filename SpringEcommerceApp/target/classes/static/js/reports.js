/**
 * File JavaScript cho trang báo cáo thống kê
 * Chỉ xử lý vẽ biểu đồ với dữ liệu được cấp từ Controller
 */
document.addEventListener('DOMContentLoaded', function() {
    // Lấy dữ liệu từ biến được chèn bởi Thymeleaf
    if (typeof reportData === 'undefined') {
        console.error('Report data is not available');
        return;
    }

    // Vẽ biểu đồ doanh thu theo thời gian
    if (document.getElementById('revenueTimeChart')) {
        const revenueTimeChart = new Chart(
            document.getElementById('revenueTimeChart').getContext('2d'),
            {
                type: 'line',
                data: {
                    labels: reportData.revenueByPeriod.labels,
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: reportData.revenueByPeriod.values,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    if (value >= 1000000) {
                                        return (value / 1000000).toFixed(1) + 'M';
                                    } else if (value >= 1000) {
                                        return (value / 1000).toFixed(1) + 'K';
                                    }
                                    return value;
                                }
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let value = context.raw;
                                    value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                    return 'Doanh thu: ' + value + ' VNĐ';
                                }
                            }
                        }
                    }
                }
            }
        );
    }

    // Vẽ biểu đồ doanh thu theo danh mục
    if (document.getElementById('categoryRevenueChart')) {
        const categoryRevenueChart = new Chart(
            document.getElementById('categoryRevenueChart').getContext('2d'),
            {
                type: 'pie',
                data: {
                    labels: reportData.categoryRevenue.labels,
                    datasets: [{
                        data: reportData.categoryRevenue.values,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 206, 86, 0.7)',
                            'rgba(75, 192, 192, 0.7)',
                            'rgba(153, 102, 255, 0.7)',
                            'rgba(255, 159, 64, 0.7)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.label + ': ' + context.raw + '%';
                                }
                            }
                        }
                    }
                }
            }
        );
    }

    // Vẽ biểu đồ trạng thái đơn hàng
    if (document.getElementById('orderStatusChart')) {
        const orderStatusChart = new Chart(
            document.getElementById('orderStatusChart').getContext('2d'),
            {
                type: 'doughnut',
                data: {
                    labels: reportData.orderStatus.labels,
                    datasets: [{
                        data: reportData.orderStatus.values,
                        backgroundColor: [
                            'rgba(108, 117, 125, 0.7)',  // Chờ xác nhận
                            'rgba(13, 110, 253, 0.7)',   // Đang xử lý
                            'rgba(13, 202, 240, 0.7)',   // Đang giao hàng
                            'rgba(25, 135, 84, 0.7)',    // Đã hoàn thành
                            'rgba(220, 53, 69, 0.7)'     // Đã hủy
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let value = context.raw;
                                    let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    let percentage = Math.round((value / total) * 100) + '%';
                                    return context.label + ': ' + value + ' (' + percentage + ')';
                                }
                            }
                        }
                    }
                }
            }
        );
    }

    // Vẽ biểu đồ top sản phẩm bán chạy
    if (document.getElementById('topProductsChart')) {
        const topProductsChart = new Chart(
            document.getElementById('topProductsChart').getContext('2d'),
            {
                type: 'bar',
                data: {
                    labels: reportData.topProducts.labels,
                    datasets: [{
                        label: 'Số lượng bán',
                        data: reportData.topProducts.values,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    scales: {
                        x: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
    }

    // Xử lý nút in báo cáo
    if (document.getElementById('printReport')) {
        document.getElementById('printReport').addEventListener('click', function() {
            window.print();
        });
    }
});

/**
 * Xử lý export báo cáo ra Excel
 */
function exportReportToExcel() {
    const reportType = document.getElementById('reportType').value;
    const periodType = document.getElementById('periodType').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    // Redirect đến API endpoint để download báo cáo Excel
    window.location.href = `/admin/reports/export?reportType=${reportType}&periodType=${periodType}&fromDate=${fromDate}&toDate=${toDate}`;
}

// Thêm event listener cho nút xuất Excel
document.addEventListener('DOMContentLoaded', function() {
    // Lắng nghe sự kiện click của nút export Excel
    const exportButton = document.getElementById('exportReport');
    if (exportButton) {
        exportButton.addEventListener('click', function(e) {
            e.preventDefault();
            exportReportToExcel();
        });
    }
});
