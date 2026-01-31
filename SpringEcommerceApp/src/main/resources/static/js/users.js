/**
 * Xử lý quản lý người dùng - UI interactions only
 * Mọi xử lý dữ liệu được thực hiện ở phía server
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo xử lý cho các nút thao tác trong UI
    initializeActionButtons();
    
    // Xử lý filter và tìm kiếm UI
    initializeFilterForm();
});

/**
 * Khởi tạo xử lý cho các nút thao tác 
 * Chỉ xử lý các tương tác UI, không xử lý dữ liệu
 */
function initializeActionButtons() {
    // Tham chiếu tới các nút xác nhận hành động
    const blockButtons = document.querySelectorAll('.btn-block-user');
    blockButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?')) {
                e.preventDefault();
            }
        });
    });
    
    const deleteButtons = document.querySelectorAll('.btn-delete-user');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.')) {
                e.preventDefault();
            }
        });
    });
}

/**
 * Khởi tạo xử lý cho form lọc và tìm kiếm
 * Chỉ xử lý tương tác UI, không xử lý dữ liệu
 */
function initializeFilterForm() {
    const contextPath = window.appContextPath || '';
    const filterForm = document.querySelector(`form[action="${contextPath}/admin/users"]`);
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
    }
}

// Loại bỏ các hàm không cần thiết:
// - validateEmail: validation nên được thực hiện ở phía server
// - confirmBlockUser, confirmUnblockUser, confirmDeleteUser: 
//   đã được thay thế bằng event listeners trong initializeActionButtons
