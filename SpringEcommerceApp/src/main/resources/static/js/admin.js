// Admin JavaScript file
console.log('Admin JS file loaded successfully!');

// Initialize components if they exist
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo các thành phần UI
    initSidebar();
    initTooltips();
    initDataTables();
    initNotifications();
});

/**
 * Khởi tạo sidebar
 */
function initSidebar() {
    // Mobile sidebar toggle
    const sidebarToggle = document.querySelector('.navbar-toggler');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('mobile-show');
        });
    }
    
    // Active menu item
    const currentUrl = window.location.pathname;
    const navLinks = document.querySelectorAll('.admin-sidebar .nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
        }
    });
}

/**
 * Khởi tạo tooltips
 */
function initTooltips() {
    // Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Khởi tạo DataTables nếu có
 */
function initDataTables() {
    // Kiểm tra nếu jQuery và DataTable script đã được load
    if (typeof $ !== 'undefined' && typeof $.fn.DataTable !== 'undefined') {
        $('.data-table').DataTable({
            responsive: true,
            language: {
                search: "Tìm kiếm:",
                lengthMenu: "Hiển thị _MENU_ mục",
                info: "Hiển thị _START_ đến _END_ của _TOTAL_ mục",
                paginate: {
                    first: "Đầu",
                    last: "Cuối",
                    next: "Sau",
                    previous: "Trước"
                }
            }
        });
    } else {
        console.warn('jQuery or DataTables not available, skipping DataTables initialization');
    }
}

/**
 * Khởi tạo thông báo
 */
function initNotifications() {
    // Xử lý hiển thị và ẩn thông báo
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(function() {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

/**
 * Format số thành định dạng tiền tệ
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Xử lý logout
 */
function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        window.location.href = '/logout';
    }
}
