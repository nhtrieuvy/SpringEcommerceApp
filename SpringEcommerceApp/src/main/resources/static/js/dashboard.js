/**
 * Dashboard.js - File JavaScript để vẽ biểu đồ cho trang quản trị dashboard
 * Sử dụng Chart.js để tạo biểu đồ từ dữ liệu được cung cấp bởi controller
 */
document.addEventListener("DOMContentLoaded", function() {
    // Vẽ biểu đồ doanh thu theo tháng
    renderRevenueChart();
    
    // Vẽ biểu đồ đơn hàng theo trạng thái
    renderOrderStatusChart();
});

/**
 * Vẽ biểu đồ doanh thu theo thời gian
 */
function renderRevenueChart() {
    // Lấy context của canvas
    var ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Tạo gradient cho nền của biểu đồ
    var gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(54, 162, 235, 0.6)');
    gradient.addColorStop(1, 'rgba(54, 162, 235, 0.1)');
    
    // Tạo biểu đồ doanh thu
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: revenueData.labels,
            datasets: [{
                label: 'Doanh thu (VNĐ)',
                data: revenueData.values,
                backgroundColor: gradient,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            var value = context.raw;
                            value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            return 'Doanh thu: ' + value + ' VNĐ';
                        }
                    }
                }
            },
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
            }
        }
    });
}

/**
 * Vẽ biểu đồ đơn hàng theo trạng thái
 */
function renderOrderStatusChart() {
    // Lấy context của canvas
    var ctx = document.getElementById('orderStatusChart').getContext('2d');
    
    // Màu sắc cho các trạng thái đơn hàng
    var colors = [
        'rgba(255, 159, 64, 0.8)',   // Chờ xác nhận
        'rgba(54, 162, 235, 0.8)',   // Đang xử lý
        'rgba(255, 205, 86, 0.8)',   // Đang giao hàng
        'rgba(75, 192, 192, 0.8)',   // Đã hoàn thành
        'rgba(255, 99, 132, 0.8)'    // Đã hủy
    ];
    
    // Tạo biểu đồ trạng thái đơn hàng
    var chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: orderStatusData.labels,
            datasets: [{
                data: orderStatusData.values,
                backgroundColor: colors,
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            var label = context.label || '';
                            var value = context.raw;
                            var total = context.dataset.data.reduce((a, b) => a + b, 0);
                            var percentage = ((value / total) * 100).toFixed(1) + '%';
                            return label + ': ' + value + ' (' + percentage + ')';
                        }
                    }
                }
            }
        }
    });
}
