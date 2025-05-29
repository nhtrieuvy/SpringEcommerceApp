package com.ecommerce.controllers;

import com.ecommerce.pojo.Category;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.Role;
import com.ecommerce.pojo.Store;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.OrderRepository;
import com.ecommerce.services.CategoryService;
import com.ecommerce.services.OrderService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.RoleService;
import com.ecommerce.services.UserService;
import com.ecommerce.services.StoreService;
import com.ecommerce.utils.IpUtils;

import com.ecommerce.services.ReportService;
import com.ecommerce.services.RecentActivityService;
import com.ecommerce.pojo.RecentActivity;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/admin")
public class AdminController {@Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private RoleService roleService;    @Autowired
    private StoreService storeService;    @Autowired
    private ReportService reportService;
    
    @Autowired
    private RecentActivityService recentActivityService;
    
    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("")
    public String adminDashboard(Model model) {
        // Thống kê tổng số người dùng
        List<User> users = userService.findAll();
        model.addAttribute("totalUsers", users.size());

        // Thống kê số lượng sản phẩm
        List<Product> products = productService.findAll();
        model.addAttribute("totalProducts", products.size());

        // Thống kê số lượng đơn hàng
        List<Order> orders = orderService.findAll();
        model.addAttribute("totalOrders", orders.size());

        // Thống kê tổng doanh thu từ đơn hàng
        double totalRevenue = orders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()))
                .mapToDouble(order -> order.getTotalAmount())
                .sum();
        model.addAttribute("totalRevenue", totalRevenue);

        // Lấy dữ liệu báo cáo thống kê từ service
        // Mặc định lấy dữ liệu 30 ngày gần đây
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, -30);
        Date fromDate = cal.getTime();
        Date toDate = new Date();

        // Thống kê doanh thu theo tháng cho biểu đồ
        Map<String, Object> revenueData = reportService.generateSalesReport("monthly", fromDate, toDate);
        model.addAttribute("revenueData", revenueData.get("revenueByPeriod"));        // Thống kê đơn hàng theo trạng thái
        model.addAttribute("orderStatusData", revenueData.get("orderStatus"));

        // Lấy hoạt động gần đây
        List<RecentActivity> recentActivities = recentActivityService.getRecentActivities(10);
        model.addAttribute("recentActivities", recentActivities);

        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "dashboard");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "dashboard :: content");

        // Return admin-layout template
        return "admin";
    }

    @GetMapping("/users")
    public String manageUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            Model model) {

        List<User> allUsers = userService.findAll();

        // Áp dụng bộ lọc nếu có
        if (role != null && !role.isEmpty()) {
            allUsers = allUsers.stream()
                    .filter(user -> user.getRoles().stream()
                            .anyMatch(r -> r.getName().equals(role)))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.isEmpty()) {
            boolean isActive = "active".equals(status);
            allUsers = allUsers.stream()
                    .filter(user -> user.isActive() == isActive)
                    .collect(Collectors.toList());
        }

        if (keyword != null && !keyword.isEmpty()) {
            allUsers = allUsers.stream()
                    .filter(user -> (user.getUsername() != null
                            && user.getUsername().toLowerCase().contains(keyword.toLowerCase())) ||
                            (user.getEmail() != null && user.getEmail().toLowerCase().contains(keyword.toLowerCase()))
                            ||
                            (user.getFullname() != null
                                    && user.getFullname().toLowerCase().contains(keyword.toLowerCase())))
                    .collect(Collectors.toList());
        }

        // Phân trang
        int start = page * size;
        int end = Math.min(start + size, allUsers.size());

        List<User> paginatedUsers = allUsers.subList(start, end);

        // Lấy danh sách các vai trò
        List<Role> allRoles = roleService.findAll();
        model.addAttribute("users", paginatedUsers);
        model.addAttribute("allRoles", allRoles);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allUsers.size() / size));
        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "users");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "users :: content");

        return "admin";
    }

    @GetMapping("/products")
    public String manageProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            Model model) {

        List<Product> allProducts = productService.findAll();

        // Áp dụng bộ lọc nếu có
        if (category != null) {
            allProducts = allProducts.stream()
                    .filter(product -> product.getCategory() != null &&
                            product.getCategory().getId().equals(category))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.isEmpty()) {
            boolean isActive = "active".equals(status);
            allProducts = allProducts.stream()
                    .filter(product -> product.isActive() == isActive)
                    .collect(Collectors.toList());
        }

        if (keyword != null && !keyword.isEmpty()) {
            allProducts = allProducts.stream()
                    .filter(product -> (product.getName() != null
                            && product.getName().toLowerCase().contains(keyword.toLowerCase())) ||
                            (product.getDescription() != null
                                    && product.getDescription().toLowerCase().contains(keyword.toLowerCase())))
                    .collect(Collectors.toList());
        }        // Phân trang
        int start = page * size;
        int end = Math.min(start + size, allProducts.size());

        List<Product> paginatedProducts = allProducts.subList(start, end);        // Lấy danh sách danh mục và stores
        List<Category> categories = categoryService.findAll();
        List<Store> stores = storeService.findAll(); // Lấy tất cả các cửa hàng thay vì sellers
        model.addAttribute("products", paginatedProducts);
        model.addAttribute("categories", categories);
        model.addAttribute("stores", stores); // Truyền stores thay vì sellers
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allProducts.size() / size));
        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "products");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "products :: content");
        System.out.println("Debug: Total products in DB: " + allProducts.size());
        System.out
                .println("Debug: Filter params: category=" + category + ", status=" + status + ", keyword=" + keyword);
        System.out.println("Debug: Page=" + page + ", Size=" + size);
        System.out.println("Debug: Products after pagination: " + paginatedProducts.size());

        return "admin";
    }

    @GetMapping("/orders")
    public String manageOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,
            @RequestParam(required = false) String keyword,
            Model model) {

        List<Order> allOrders = orderService.findAll();

        // Áp dụng bộ lọc nếu có
        if (status != null && !status.isEmpty()) {
            allOrders = allOrders.stream()
                    .filter(order -> status.equals(order.getStatus()))
                    .collect(Collectors.toList());
        }

        if (fromDate != null && toDate != null) {
            allOrders = allOrders.stream()
                    .filter(order -> !order.getOrderDate().before(fromDate) && !order.getOrderDate().after(toDate))
                    .collect(Collectors.toList());
        } else if (fromDate != null) {
            allOrders = allOrders.stream()
                    .filter(order -> !order.getOrderDate().before(fromDate))
                    .collect(Collectors.toList());
        } else if (toDate != null) {
            allOrders = allOrders.stream()
                    .filter(order -> !order.getOrderDate().after(toDate))
                    .collect(Collectors.toList());
        }

        if (keyword != null && !keyword.isEmpty()) {
            allOrders = allOrders.stream()
                    .filter(order -> (order.getId() != null && order.getId().toString().contains(keyword)) ||
                            (order.getUser() != null && order.getUser().getFullname() != null &&
                                    order.getUser().getFullname().toLowerCase().contains(keyword.toLowerCase())))
                    .collect(Collectors.toList());
        }

        // Phân trang
        int start = page * size;
        int end = Math.min(start + size, allOrders.size());

        List<Order> paginatedOrders = allOrders.subList(start, end);
        model.addAttribute("orders", paginatedOrders);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allOrders.size() / size));
        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "orders");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "orders :: content");

        return "admin";
    }

    @GetMapping("/reports")
    public String viewReports(
            @RequestParam(defaultValue = "sales") String reportType,
            @RequestParam(defaultValue = "monthly") String periodType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate,
            Model model) {

        // Nếu không có ngày được chọn, mặc định là 30 ngày gần đây
        if (fromDate == null) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, -30);
            fromDate = cal.getTime();
        }

        if (toDate == null) {
            toDate = new Date(); // Ngày hiện tại
        }        // Lấy dữ liệu báo cáo thống kê từ service
        Map<String, Object> reportData;
        switch (reportType) {
            case "sales":
                reportData = reportService.generateSalesReport(periodType, fromDate, toDate);
                break;
            case "sellers":
                reportData = reportService.generateSellerReport(fromDate, toDate);
                break;
            default:
                reportData = reportService.generateSalesReport(periodType, fromDate, toDate);
        }

        model.addAttribute("reportData", reportData);
        model.addAttribute("reportType", reportType);
        model.addAttribute("periodType", periodType);
        model.addAttribute("fromDate", fromDate);
        model.addAttribute("toDate", toDate);

        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "reports");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "reports :: content");

        return "admin";
    }

    @GetMapping("/orders/print/{id}")
    public String printOrder(@PathVariable Long id, Model model) {
        Order order = orderService.findById(id);

        if (order == null) {
            model.addAttribute("errorMessage", "Không tìm thấy đơn hàng!");
            return "redirect:/admin/orders";
        }

        model.addAttribute("order", order);
        model.addAttribute("printDate", new Date());

        return "order-print";
    }

    @GetMapping("/orders/export")
    public ResponseEntity<byte[]> exportOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {

        // Lọc đơn hàng theo điều kiện
        List<Order> orders = orderService.findByStatusAndDateRange(status, fromDate, toDate);

        // Sử dụng OrderService để tạo file Excel
        byte[] excelContent = orderService.generateOrderExcel(orders);

        // Thiết lập header cho response
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment",
                "orders_export_" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + ".xlsx");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReports(
            @RequestParam(defaultValue = "sales") String reportType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {

        // Nếu không có ngày được chọn, mặc định là 30 ngày gần đây
        if (fromDate == null) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, -30);
            fromDate = cal.getTime();
        }

        if (toDate == null) {
            toDate = new Date(); // Ngày hiện tại
        }

        // Sử dụng ReportService để tạo file Excel
        byte[] excelContent = reportService.exportReportToExcel(reportType, fromDate, toDate);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", reportType + "-report.xlsx");

        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @GetMapping("/admin/revenue-chart-data")
    public ResponseEntity<?> getRevenueChartData(@RequestParam String periodType,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        List<String> labels = new ArrayList<>();
        List<Double> values = new ArrayList<>();

        // Nhóm doanh thu theo thời gian tùy theo loại kỳ
        // Triển khai logic phân nhóm theo ngày, tuần, tháng, năm
        SimpleDateFormat dateFormat;
        if ("daily".equals(periodType)) {
            dateFormat = new SimpleDateFormat("dd/MM");
        } else if ("weekly".equals(periodType)) {
            dateFormat = new SimpleDateFormat("'Week 'w, yyyy");
        } else if ("monthly".equals(periodType)) {
            dateFormat = new SimpleDateFormat("MM/yyyy");
        } else {
            dateFormat = new SimpleDateFormat("yyyy");
        }

        // Giả lập dữ liệu mẫu cho các label và values
        for (int i = 0; i < 12; i++) {
            Calendar cal = Calendar.getInstance();
            // Complete the implementation here
        }

        // Return the data as a JSON response
        Map<String, Object> response = new HashMap<>();
        response.put("labels", labels);
        response.put("values", values);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> generateCategoryRevenueData(List<Order> orders) {
        Map<String, Object> data = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Integer> values = new ArrayList<>();

        // Giả lập dữ liệu mẫu cho các label và values
        labels.add("Điện tử");
        labels.add("Thời trang");
        labels.add("Đồ gia dụng");
        labels.add("Sách");
        labels.add("Thể thao");

        values.add(35);
        values.add(25);
        values.add(20);
        values.add(10);
        values.add(10);

        data.put("labels", labels);
        data.put("values", values);

        return data;
    }

    // ==================== User Management Methods ====================

    @PostMapping("/users/add")
    public String addUser(@ModelAttribute User user,
            @RequestParam(required = false) List<String> roles,
            RedirectAttributes redirectAttributes) {

        try { // Xử lý thêm vai trò
            if (roles != null && !roles.isEmpty()) {
                Set<Role> userRoles = new HashSet<>();
                for (String roleName : roles) {
                    // Sử dụng phương thức mới chuẩn hóa tên vai trò
                    Role role = roleService.findByNameNormalized(roleName);
                    if (role != null) {
                        userRoles.add(role);
                    }
                }
                user.setRoles(userRoles);
            }

            // Mặc định là active
            user.setActive(true);

            // Lưu người dùng
            userService.addUser(user);

            // Thêm thông báo thành công
            redirectAttributes.addFlashAttribute("successMessage", "Người dùng đã được thêm thành công!");

        } catch (Exception e) {
            // Thêm thông báo lỗi
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi thêm người dùng: " + e.getMessage());
        }

        return "redirect:/admin/users";
    }

    @GetMapping("/users/edit/{id}")
    public String showEditUserForm(@PathVariable Long id, Model model) {
        User user = userService.findById(id);

        if (user == null) {
            model.addAttribute("errorMessage", "Không tìm thấy người dùng!");
            return "redirect:/admin/users";
        }

        List<Role> allRoles = roleService.findAll();

        model.addAttribute("user", user);
        model.addAttribute("allRoles", allRoles);
        model.addAttribute("activeMenu", "users");
        model.addAttribute("content", "edit-user :: content");

        return "admin";
    }

    @PostMapping("/users/edit/{id}")
    public String updateUser(@PathVariable Long id,
            @ModelAttribute User user,
            @RequestParam(required = false) List<String> roles,
            RedirectAttributes redirectAttributes) {

        try {
            // Kiểm tra người dùng tồn tại
            User existingUser = userService.findById(id);
            if (existingUser == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy người dùng!");
                return "redirect:/admin/users";
            }

            // Cập nhật thông tin
            existingUser.setFullname(user.getFullname());
            existingUser.setEmail(user.getEmail());

            // Cập nhật mật khẩu nếu có thay đổi
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(user.getPassword());
            } // Cập nhật vai trò
            if (roles != null && !roles.isEmpty()) {
                Set<Role> userRoles = new HashSet<>();
                for (String roleName : roles) {
                    // Sử dụng phương thức mới chuẩn hóa tên vai trò
                    Role role = roleService.findByNameNormalized(roleName);
                    if (role != null) {
                        userRoles.add(role);
                    }
                }
                existingUser.setRoles(userRoles);
            }

            // Cập nhật trạng thái
            existingUser.setActive(user.isActive());

            // Lưu người dùng
            userService.update(existingUser);

            // Thêm thông báo thành công
            redirectAttributes.addFlashAttribute("successMessage", "Cập nhật người dùng thành công!");

        } catch (Exception e) {
            // Thêm thông báo lỗi
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi cập nhật người dùng: " + e.getMessage());
        }

        return "redirect:/admin/users";
    }

    @GetMapping("/users/block/{id}")
    public String blockUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findById(id);

            if (user != null) {
                // Đảo ngược trạng thái
                user.setActive(!user.isActive());
                userService.update(user);

                String message = user.isActive() ? "Người dùng đã được kích hoạt thành công."
                        : "Người dùng đã bị khóa thành công.";

                redirectAttributes.addFlashAttribute("successMessage", message);
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy người dùng!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi thay đổi trạng thái người dùng: " + e.getMessage());
        }

        return "redirect:/admin/users";
    }

    @GetMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findById(id);

            if (user != null) {
                userService.delete(id);
                redirectAttributes.addFlashAttribute("successMessage", "Người dùng đã được xóa thành công.");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy người dùng!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi xóa người dùng: " + e.getMessage());
        }

        return "redirect:/admin/users";
    }

    // ==================== Product Management Methods ====================    @PostMapping("/products/add")
    public String addProduct(@AuthenticationPrincipal UserDetails userDetails,
            @ModelAttribute Product product,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long storeId,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        try {            // Thiết lập danh mục
            Category category = categoryService.findById(categoryId);
            if (category != null) {
                product.setCategory(category);
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Danh mục không tồn tại!");
                return "redirect:/admin/products";
            }
            
            // Thiết lập cửa hàng
            if (storeId != null) {
                com.ecommerce.pojo.Store store = storeService.findById(storeId);
                if (store != null) {
                    product.setStore(store);
                } else {
                    redirectAttributes.addFlashAttribute("errorMessage", "Cửa hàng không tồn tại!");
                    return "redirect:/admin/products";
                }
            }

            // Xử lý tải lên hình ảnh nếu có
            if (image != null && !image.isEmpty()) {
                // Lưu hình ảnh và lấy URL
                // Thường sẽ có mã xử lý lưu hình ảnh vào thư mục hoặc cloud storage
                String imagePath = saveProductImage(image);
                product.setImage(imagePath);
            }

            // Thiết lập trạng thái mặc định là active
            product.setActive(true);

            // Lưu sản phẩm
            Product savedProduct = productService.save(product);

            // Log activity if user is authenticated
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductAdded(
                        currentUser.getFullname(),
                        currentUser.getEmail(),
                        savedProduct.getId(),
                        savedProduct.getName(),
                        ipAddress
                    );
                }
            }

            redirectAttributes.addFlashAttribute("successMessage", "Thêm sản phẩm thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi thêm sản phẩm: " + e.getMessage());
        }

        return "redirect:/admin/products";
    }

    @GetMapping("/products/edit/{id}")
    public String showEditProductForm(@PathVariable Long id, Model model) {
        Product product = productService.findById(id);

        if (product == null) {
            model.addAttribute("errorMessage", "Không tìm thấy sản phẩm!");
            return "redirect:/admin/products";
        }

        List<Category> categories = categoryService.findAll();

        model.addAttribute("product", product);
        model.addAttribute("categories", categories);
        model.addAttribute("activeMenu", "products");
        model.addAttribute("content", "edit-product :: content");

        return "admin";
    }    @PostMapping("/products/edit/{id}")
    public String updateProduct(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @ModelAttribute Product product,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long storeId,
            @RequestParam(value = "image", required = false) MultipartFile image,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        try {
            // Lấy thông tin sản phẩm hiện tại
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy sản phẩm!");
                return "redirect:/admin/products";
            }

            // Cập nhật thông tin cơ bản
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setQuantity(product.getQuantity());
            existingProduct.setActive(product.isActive());

            // Cập nhật danh mục
            Category category = categoryService.findById(categoryId);
            if (category != null) {
                existingProduct.setCategory(category);
            }
            
            // Cập nhật cửa hàng nếu có
            if (storeId != null) {
                com.ecommerce.pojo.Store store = storeService.findById(storeId);
                if (store != null) {
                    existingProduct.setStore(store);
                }
            }

            // Xử lý tải lên hình ảnh mới nếu có
            if (image != null && !image.isEmpty()) {
                String imagePath = saveProductImage(image);
                existingProduct.setImage(imagePath);
            }

            // Lưu sản phẩm đã cập nhật
            Product updatedProduct = productService.update(existingProduct);

            // Log activity if user is authenticated
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductUpdated(
                        currentUser.getFullname(),
                        currentUser.getEmail(),
                        updatedProduct.getId(),
                        updatedProduct.getName(),
                        ipAddress
                    );
                }
            }

            redirectAttributes.addFlashAttribute("successMessage", "Cập nhật sản phẩm thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi cập nhật sản phẩm: " + e.getMessage());
        }

        return "redirect:/admin/products";
    }

    @GetMapping("/products/toggle/{id}")
    public String toggleProductStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Product product = productService.findById(id);

            if (product != null) {
                // Đảo ngược trạng thái
                product.setActive(!product.isActive());
                productService.update(product);

                String message = product.isActive() ? "Sản phẩm đã được kích hoạt thành công."
                        : "Sản phẩm đã bị vô hiệu hóa thành công.";

                redirectAttributes.addFlashAttribute("successMessage", message);
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy sản phẩm!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi thay đổi trạng thái sản phẩm: " + e.getMessage());
        }

        return "redirect:/admin/products";
    }

    @GetMapping("/products/delete/{id}")
    public String deleteProduct(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Product product = productService.findById(id);

            if (product != null) {
                productService.delete(id);
                redirectAttributes.addFlashAttribute("successMessage", "Xóa sản phẩm thành công!");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy sản phẩm!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi xóa sản phẩm: " + e.getMessage());
        }

        return "redirect:/admin/products";
    }

    // Helper method to save product image
    private String saveProductImage(MultipartFile image) {
        try {
            // Trong môi trường thực tế, có thể sẽ lưu vào thư mục trên server hoặc cloud
            // storage
            // Đây là bản demo đơn giản
            String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            String uploadDir = "src/main/resources/static/images/products/";
            java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);
            java.nio.file.Files.createDirectories(path.getParent());
            java.nio.file.Files.copy(image.getInputStream(), path, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            return "/images/products/" + fileName;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // ==================== Order Management Methods ====================    @PostMapping("/orders/update-status")
    public String updateOrderStatus(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        try {
            Order order = orderService.findById(orderId);
            if (order != null) {
                // Lưu trạng thái trước đó để thông báo
                String previousStatus = order.getStatus();
                // Cập nhật trạng thái mới
                order.setStatus(status);

                // Lưu thông tin người dùng thực hiện thao tác (nếu có authentication)
                Long userId = null;
                User currentUser = null;
                try {
                    // Lấy thông tin người dùng đang đăng nhập từ Spring Security
                    Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                            .getAuthentication().getPrincipal();
                    if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                        String username = ((org.springframework.security.core.userdetails.UserDetails) principal)
                                .getUsername();
                        currentUser = userService.findByUsername(username);
                        if (currentUser != null) {
                            userId = currentUser.getId();
                        }
                    }
                } catch (Exception e) {
                    // Không xử lý nếu không thể lấy thông tin người dùng
                }                // Cập nhật đơn hàng mà không tạo lịch sử (để tránh bị trùng lặp)
                orderService.updateWithoutHistory(order);
                
                // Thêm lịch sử trạng thái với ghi chú
                orderService.addOrderStatusHistory(order, status, note, userId);                // Log activity if user is authenticated
                if (userDetails != null && currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logOrderStatusChanged(
                        currentUser.getEmail(),
                        currentUser.getFullname(),
                        order.getId(),
                        status,
                        ipAddress
                    );
                }

                // Nếu trạng thái là completed, có thể thực hiện các hành động bổ sung
                if ("COMPLETED".equals(status)) {
                    // Xử lý khi đơn hàng hoàn thành
                    // Ví dụ: gửi email thông báo, cập nhật điểm thưởng, v.v.
                }

                // Thông báo thành công
                redirectAttributes.addFlashAttribute("successMessage",
                        "Cập nhật trạng thái đơn hàng từ '" + getStatusDisplayName(previousStatus) +
                                "' thành '" + getStatusDisplayName(status) + "' thành công!");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy đơn hàng!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi cập nhật trạng thái đơn hàng: " + e.getMessage());
        }

        return "redirect:/admin/orders";
    }

    @GetMapping("/orders/detail/{id}")
    public String viewOrderDetail(@PathVariable Long id, Model model) {
        Order order = orderService.findById(id);

        if (order == null) {
            model.addAttribute("errorMessage", "Không tìm thấy đơn hàng!");
            return "redirect:/admin/orders";
        }

        model.addAttribute("order", order);
        model.addAttribute("activeMenu", "orders");
        model.addAttribute("content", "order-detail :: content");

        return "admin";
    }

    @GetMapping("/orders/{id}/history")
    public String viewOrderHistory(@PathVariable Long id, Model model) {
        Order order = orderService.findById(id);

        if (order == null) {
            model.addAttribute("errorMessage", "Không tìm thấy đơn hàng!");
            return "redirect:/admin/orders";
        }

        // Lấy lịch sử trạng thái đơn hàng từ service
        List<OrderStatusHistory> history = orderService.getOrderStatusHistory(id);

        model.addAttribute("order", order);
        model.addAttribute("history", history);
        model.addAttribute("activeMenu", "orders");
        model.addAttribute("content", "order-history :: content");

        return "admin";
    }

    // Helper method to get friendly status display name
    private String getStatusDisplayName(String statusCode) {
        switch (statusCode) {
            case "PENDING":
                return "Chờ xác nhận";
            case "PROCESSING":
                return "Đang xử lý";
            case "SHIPPING":
                return "Đang giao hàng";
            case "COMPLETED":
                return "Đã hoàn thành";
            case "CANCELLED":
                return "Đã hủy";
            default:
                return statusCode;
        }
    }

    // ==================== Store Management Methods ====================

    @GetMapping("/stores")
    public String manageStores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            Model model) {

        // Lấy danh sách cửa hàng từ service
        List<Map<String, Object>> allStores = storeService.findAllWithUserInfo();

        // Áp dụng bộ lọc nếu có
        if (status != null && !status.isEmpty()) {
            boolean isActive = "active".equals(status);
            allStores = allStores.stream()
                    .filter(store -> (boolean) store.get("active") == isActive)
                    .collect(Collectors.toList());
        }

        if (keyword != null && !keyword.isEmpty()) {
            allStores = allStores.stream()
                    .filter(store -> 
                        ((String) store.get("name") != null && 
                         ((String) store.get("name")).toLowerCase().contains(keyword.toLowerCase())) ||
                        ((String) store.get("description") != null && 
                         ((String) store.get("description")).toLowerCase().contains(keyword.toLowerCase())) ||
                        ((String) store.get("username") != null && 
                         ((String) store.get("username")).toLowerCase().contains(keyword.toLowerCase()))
                    )
                    .collect(Collectors.toList());
        }

        // Phân trang
        int start = page * size;
        int end = Math.min(start + size, allStores.size());

        List<Map<String, Object>> paginatedStores = allStores.subList(start, end);
        
        model.addAttribute("stores", paginatedStores);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allStores.size() / size));
        
        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "stores");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "stores :: content");

        return "admin";
    }

    @GetMapping("/stores/view/{id}")
    public String viewStore(@PathVariable Long id, Model model) {
        Map<String, Object> store = storeService.findByIdWithUserInfo(id);
        
        if (store == null) {
            model.addAttribute("errorMessage", "Không tìm thấy cửa hàng!");
            return "redirect:/admin/stores";
        }
        
        // Get products for this store
        List<Product> storeProducts = productService.findByStoreId(id);
        
        model.addAttribute("store", store);
        model.addAttribute("products", storeProducts);
        model.addAttribute("activeMenu", "stores");
        model.addAttribute("content", "store-detail :: content");
        
        return "admin";
    }
    
    @GetMapping("/stores/toggle/{id}")
    public String toggleStoreStatus(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            boolean success = storeService.toggleStatus(id);
            
            if (success) {
                redirectAttributes.addFlashAttribute("successMessage", "Trạng thái cửa hàng đã được cập nhật!");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy cửa hàng!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", 
                    "Lỗi khi thay đổi trạng thái cửa hàng: " + e.getMessage());
        }
        
        return "redirect:/admin/stores";
    }

    // ==================== Seller Request Management Methods ====================

    @GetMapping("/seller-requests")
    public String manageSellerRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            Model model) {

        // Get list of seller requests from service
        // This will now return user role change requests instead of seller requests
        List<Map<String, Object>> allRequests = userService.findAllSellerRequests();

        // Áp dụng bộ lọc nếu có
        if (status != null && !status.isEmpty()) {
            allRequests = allRequests.stream()
                    .filter(request -> status.equals(request.get("status")))
                    .collect(Collectors.toList());
        }

        // Phân trang
        int start = page * size;
        int end = Math.min(start + size, allRequests.size());

        List<Map<String, Object>> paginatedRequests = allRequests.subList(start, end);
        
        model.addAttribute("requests", paginatedRequests);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allRequests.size() / size));
        
        // Thêm menu active để đánh dấu menu hiện tại
        model.addAttribute("activeMenu", "sellerRequests");

        // Set the content fragment to be included in the layout
        model.addAttribute("content", "seller-requests :: content");

        return "admin";
    }

    @PostMapping("/seller-requests/approve/{id}")
    public String approveSellerRequest(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            // Update the user to have seller role instead of creating a seller entity
            boolean success = userService.approveSellerRequest(id);
            
            if (success) {
                redirectAttributes.addFlashAttribute("successMessage", "Đã phê duyệt yêu cầu trở thành người bán thành công!");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy yêu cầu hoặc đã xử lý trước đó!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi xử lý yêu cầu: " + e.getMessage());
        }
        
        return "redirect:/admin/seller-requests";
    }

    @PostMapping("/seller-requests/reject/{id}")
    public String rejectSellerRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            RedirectAttributes redirectAttributes) {
        try {
            // Update the seller request status instead of deleting a seller entity
            boolean success = userService.rejectSellerRequest(id, reason);
            
            if (success) {
                redirectAttributes.addFlashAttribute("successMessage", "Đã từ chối yêu cầu trở thành người bán!");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy yêu cầu hoặc đã xử lý trước đó!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi xử lý yêu cầu: " + e.getMessage());
        }
        
        return "redirect:/admin/seller-requests";
    }
}
