/**
 * Xử lý quản lý đơn hàng - Chỉ xử lý tương tác UI, không xử lý dữ liệu
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo xử lý cho các nút thao tác
    initializeActionButtons();
    
    // Xử lý filter và tìm kiếm
    initializeFilterForm();
    
    // Khởi tạo xử lý cập nhật trạng thái đơn hàng
    initializeStatusUpdateForms();
});

/**
 * Khởi tạo xử lý cho các nút thao tác
 */
function initializeActionButtons() {
    // Xử lý nút in đơn hàng
    const printButtons = document.querySelectorAll('.btn-print-order');
    printButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            printOrder(orderId);
        });
    });
    
    // Xử lý nút xem chi tiết đơn hàng
    const viewButtons = document.querySelectorAll('.btn-view-order');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            // Hiển thị modal chi tiết đơn hàng
            const orderDetailModal = document.getElementById('orderDetail' + orderId);
            if (orderDetailModal) {
                const modal = new bootstrap.Modal(orderDetailModal);
                modal.show();
            }
        });
    });
}

/**
 * Khởi tạo xử lý cho form lọc và tìm kiếm
 */
function initializeFilterForm() {
    const contextPath = window.appContextPath || '';
    const filterForm = document.querySelector(`form[action="${contextPath}/admin/orders"]`);
    if (filterForm) {
        // Auto-submit form khi thay đổi giá trị của filter
        const filterSelects = filterForm.querySelectorAll('select');
        filterSelects.forEach(select => {
            select.addEventListener('change', function() {
                filterForm.submit();
            });
        });
        
        // Xử lý tìm kiếm khi nhấn Enter trong ô tìm kiếm
        const searchInput = filterForm.querySelector('input[name="keyword"]');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    filterForm.submit();
                }
            });
        }
        
        // Xử lý thay đổi ngày
        const dateInputs = filterForm.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.addEventListener('change', function() {
                filterForm.submit();
            });
        });
    }
}

/**
 * Khởi tạo xử lý cập nhật trạng thái đơn hàng
 */
function initializeStatusUpdateForms() {
    const contextPath = window.appContextPath || '';
    const statusForms = document.querySelectorAll(`form[action="${contextPath}/admin/orders/update-status"]`);
    statusForms.forEach(form => {
        const statusSelect = form.querySelector('select[name="status"]');
        if (statusSelect) {
            statusSelect.addEventListener('change', function() {
                if (confirm('Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này?')) {
                    form.submit();
                } else {
                    // Khôi phục giá trị trước đó
                    statusSelect.value = statusSelect.getAttribute('data-original-value');
                }
            });
            
            // Lưu giá trị ban đầu
            statusSelect.setAttribute('data-original-value', statusSelect.value);
        }
    });
}

/**
 * In đơn hàng
 */
function printOrder(orderId) {
    const contextPath = window.appContextPath || '';
    const printUrl = `${contextPath}/admin/orders/print/${orderId}`;
    // Mở cửa sổ in
    const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');
    
    if (printWindow) {
        printWindow.addEventListener('load', function() {
            printWindow.print();
        });
    }
}

/**
 * Xác nhận hủy đơn hàng - Chỉ xử lý xác nhận và cập nhật UI form
 */
function confirmCancelOrder(orderId) {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
        const form = document.getElementById('updateOrderForm' + orderId);
        if (!form) return;
        
        // Cập nhật trường status trong form
        const statusSelect = form.querySelector('select[name="status"]');
        if (statusSelect) {
            statusSelect.value = 'CANCELLED';
        }
        
        // Thêm ghi chú hủy đơn hàng
        const noteInput = form.querySelector('input[name="note"], textarea[name="note"]');
        if (noteInput) {
            const cancelReason = prompt('Vui lòng nhập lý do hủy đơn hàng:', 'Hủy theo yêu cầu của người quản trị');
            if (cancelReason !== null) {
                noteInput.value = cancelReason;
                form.submit(); // Gửi form đến server để xử lý
            }
        } else {
            form.submit();
        }
    }
}

/**
 * Hiển thị lịch sử trạng thái đơn hàng
 * 
 * Chỉ xử lý chuyển hướng đến trang server xử lý dữ liệu lịch sử
 */
function showOrderStatusHistory(orderId) {
    // Chuyển hướng đến trang chi tiết lịch sử đơn hàng
    const contextPath = window.appContextPath || '';
    window.location.href = `${contextPath}/admin/orders/${orderId}/history`;
}
