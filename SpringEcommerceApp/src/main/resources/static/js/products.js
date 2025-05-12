/**
 * Xử lý quản lý sản phẩm
 */
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo dữ liệu cho form thêm sản phẩm
    initializeAddProductForm();
    
    // Khởi tạo xử lý cho các nút thao tác
    initializeActionButtons();
    
    // Xử lý filter và tìm kiếm
    initializeFilterForm();
    
    // Khởi tạo xử lý cho việc tải lên hình ảnh
    initializeImageUpload();
});

/**
 * Khởi tạo form thêm sản phẩm
 */
function initializeAddProductForm() {
    const addProductForm = document.querySelector('form[action="/admin/products/add"]');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            // Validate dữ liệu trước khi submit
            const name = addProductForm.querySelector('input[name="name"]').value;
            const price = addProductForm.querySelector('input[name="price"]').value;
            const categoryId = addProductForm.querySelector('select[name="categoryId"]').value;
            
            // Kiểm tra các trường bắt buộc
            if (!name || !price || !categoryId) {
                e.preventDefault();
                alert('Vui lòng điền đầy đủ thông tin bắt buộc');
                return false;
            }
            
            // Kiểm tra giá hợp lệ
            if (isNaN(price) || parseFloat(price) <= 0) {
                e.preventDefault();
                alert('Giá sản phẩm phải là số dương');
                return false;
            }
            
            return true;
        });
    }
}

/**
 * Khởi tạo xử lý cho các nút thao tác
 */
function initializeActionButtons() {
    // Bạn có thể thêm xử lý cho các nút cụ thể nếu cần
    // Các hàm như confirmDeactivateProduct, confirmActivateProduct, confirmDeleteProduct 
    // đã được định nghĩa trong trang HTML
}

/**
 * Khởi tạo xử lý cho form lọc và tìm kiếm
 */
function initializeFilterForm() {
    const filterForm = document.querySelector('form[action="/admin/products"]');
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

/**
 * Khởi tạo xử lý cho việc tải lên hình ảnh
 */
function initializeImageUpload() {
    // Xử lý preview ảnh khi chọn file
    const imageInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                
                // Tìm phần tử preview tương ứng
                const previewId = input.getAttribute('data-preview');
                const preview = document.getElementById(previewId);
                
                if (preview) {
                    reader.onload = function(e) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    };
                    
                    reader.readAsDataURL(file);
                }
            }
        });
    });
}

/**
 * Xác nhận ngừng bán sản phẩm
 */
function confirmDeactivateProduct(productId) {
    if (confirm('Bạn có chắc chắn muốn ngừng bán sản phẩm này?')) {
        window.location.href = `/admin/products/deactivate/${productId}`;
    }
}

/**
 * Xác nhận mở bán sản phẩm
 */
function confirmActivateProduct(productId) {
    if (confirm('Bạn có chắc chắn muốn mở bán sản phẩm này?')) {
        window.location.href = `/admin/products/activate/${productId}`;
    }
}

/**
 * Xác nhận xóa sản phẩm
 */
function confirmDeleteProduct(productId) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) {
        window.location.href = `/admin/products/delete/${productId}`;
    }
}
