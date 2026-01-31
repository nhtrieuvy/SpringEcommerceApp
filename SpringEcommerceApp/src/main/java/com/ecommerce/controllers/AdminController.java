package com.ecommerce.controllers;

import com.ecommerce.pojo.Category;
import com.ecommerce.pojo.Order;
import com.ecommerce.pojo.OrderStatusHistory;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.Role;
import com.ecommerce.pojo.Store;
import com.ecommerce.pojo.User;
import com.ecommerce.services.CategoryService;
import com.ecommerce.services.OrderService;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.RoleService;
import com.ecommerce.services.UserService;
import com.ecommerce.services.StoreService;
import com.ecommerce.services.SellerRequestService;
import com.ecommerce.utils.IpUtils;
import com.ecommerce.services.ReportService;
import com.ecommerce.services.RecentActivityService;
import com.ecommerce.pojo.RecentActivity;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Controller
@RequestMapping("/admin")
public class AdminController {
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    @Autowired
    private UserService userService;
    @Autowired
    private ProductService productService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private CategoryService categoryService;
    @Autowired
    private RoleService roleService;
    @Autowired
    private StoreService storeService;
    @Autowired
    private ReportService reportService;
    @Autowired
    private RecentActivityService recentActivityService;
    @Autowired
    private SellerRequestService sellerRequestService;

    @GetMapping("")
    public String adminDashboard(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("totalUsers", users.size());
        List<Product> products = productService.findAll();
        model.addAttribute("totalProducts", products.size());
        List<Order> orders = orderService.findAll();
        model.addAttribute("totalOrders", orders.size());
        double totalRevenue = orders.stream()
                .filter(order -> "COMPLETED".equals(order.getStatus()))
                .mapToDouble(order -> order.getTotalAmount())
                .sum();
        model.addAttribute("totalRevenue", totalRevenue);
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_MONTH, -30);
        Date fromDate = cal.getTime();
        Date toDate = new Date();
        Map<String, Object> revenueData = reportService.generateSalesReport("monthly", fromDate, toDate);
        model.addAttribute("revenueData", revenueData.get("revenueByPeriod"));
        model.addAttribute("orderStatusData", revenueData.get("orderStatus"));
        List<RecentActivity> recentActivities = recentActivityService.getRecentActivities(10);
        model.addAttribute("recentActivities", recentActivities);
        model.addAttribute("activeMenu", "dashboard");
        model.addAttribute("content", "dashboard :: content");
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
        int start = page * size;
        int end = Math.min(start + size, allUsers.size());
        List<User> paginatedUsers = allUsers.subList(start, end);
        List<Role> allRoles = roleService.findAll();
        model.addAttribute("users", paginatedUsers);
        model.addAttribute("allRoles", allRoles);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allUsers.size() / size));
        model.addAttribute("activeMenu", "users");
        model.addAttribute("user", new User());
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
        }
        int start = page * size;
        int end = Math.min(start + size, allProducts.size());
        List<Product> paginatedProducts = allProducts.subList(start, end);
        List<Category> categories = categoryService.findAll();
        List<Store> stores = storeService.findAll();
        Product emptyProduct = new Product();
        emptyProduct.setCategory(new Category());
        emptyProduct.setStore(new Store());
        model.addAttribute("products", paginatedProducts);
        model.addAttribute("categories", categories);
        model.addAttribute("stores", stores);
        model.addAttribute("product", emptyProduct);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allProducts.size() / size));
        model.addAttribute("activeMenu", "products");
        model.addAttribute("content", "products :: content");
        logger.debug("Total products in DB: {}", allProducts.size());
        logger.debug("Filter params: category={}, status={}, keyword={}", category, status, keyword);
        logger.debug("Page={}, Size={}", page, size);
        logger.debug("Products after pagination: {}", paginatedProducts.size());
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
        int start = page * size;
        int end = Math.min(start + size, allOrders.size());
        List<Order> paginatedOrders = allOrders.subList(start, end);
        model.addAttribute("orders", paginatedOrders);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allOrders.size() / size));
        model.addAttribute("activeMenu", "orders");
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
        if (fromDate == null) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, -30);
            fromDate = cal.getTime();
        }
        if (toDate == null) {
            toDate = new Date();
        }
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
        model.addAttribute("activeMenu", "reports");
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
        List<Order> orders = orderService.findByStatusAndDateRange(status, fromDate, toDate);
        byte[] excelContent = orderService.generateOrderExcel(orders);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment",
                "orders_export_" + new SimpleDateFormat("yyyyMMdd").format(new Date()) + ".xlsx");
        headers.setContentLength(excelContent.length);
        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @GetMapping("/reports/export")
    public ResponseEntity<byte[]> exportReports(
            @RequestParam(defaultValue = "sales") String reportType,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date fromDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date toDate) {
        if (fromDate == null) {
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_MONTH, -30);
            fromDate = cal.getTime();
        }
        if (toDate == null) {
            toDate = new Date();
        }
        byte[] excelContent = reportService.exportReportToExcel(reportType, fromDate, toDate);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(
                MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", reportType + "-report.xlsx");
        headers.setContentLength(excelContent.length);
        return new ResponseEntity<>(excelContent, headers, HttpStatus.OK);
    }

    @PostMapping("/users/add")
        public String addUser(@ModelAttribute User user,
            @RequestParam(name = "roleNames", required = false) List<String> roles,
            RedirectAttributes redirectAttributes) {
        try {
            if (roles != null && !roles.isEmpty()) {
                Set<Role> userRoles = new HashSet<>();
                for (String roleName : roles) {
                    Role role = roleService.findByNameNormalized(roleName);
                    if (role != null) {
                        userRoles.add(role);
                    }
                }
                user.setRoles(userRoles);
            }
            user.setActive(true);
            userService.addUser(user);
            redirectAttributes.addFlashAttribute("successMessage", "Người dùng đã được thêm thành công!");
        } catch (Exception e) {
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
            @RequestParam(name = "roleNames", required = false) List<String> roles,
            RedirectAttributes redirectAttributes) {
        try {
            User existingUser = userService.findById(id);
            if (existingUser == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy người dùng!");
                return "redirect:/admin/users";
            }
            existingUser.setFullname(user.getFullname());
            existingUser.setEmail(user.getEmail());
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(user.getPassword());
            }
            if (roles != null && !roles.isEmpty()) {
                Set<Role> userRoles = new HashSet<>();
                for (String roleName : roles) {
                    Role role = roleService.findByNameNormalized(roleName);
                    if (role != null) {
                        userRoles.add(role);
                    }
                }
                existingUser.setRoles(userRoles);
            }
            existingUser.setActive(user.isActive());
            userService.update(existingUser);
            redirectAttributes.addFlashAttribute("successMessage", "Cập nhật người dùng thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Lỗi khi cập nhật người dùng: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @GetMapping("/users/block/{id}")
    public String blockUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findById(id);
            if (user != null) {
                user.setActive(false);
                userService.update(user);
                redirectAttributes.addFlashAttribute("successMessage", "Người dùng đã bị khóa thành công.");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy người dùng!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi thay đổi trạng thái người dùng: " + e.getMessage());
        }
        return "redirect:/admin/users";
    }

    @GetMapping("/users/unblock/{id}")
    public String unblockUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findById(id);
            if (user != null) {
                user.setActive(true);
                userService.update(user);
                redirectAttributes.addFlashAttribute("successMessage", "Người dùng đã được kích hoạt thành công.");
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

    @PostMapping(value = "/products/add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public String addProduct(@AuthenticationPrincipal UserDetails userDetails,
            @ModelAttribute Product product,
            @RequestParam(value = "imageFile", required = false) MultipartFile image,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        try {
            if (product.getCategory() == null || product.getCategory().getId() == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Vui lòng chọn danh mục!");
                return "redirect:/admin/products";
            }
            if (product.getStore() == null || product.getStore().getId() == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Vui lòng chọn cửa hàng!");
                return "redirect:/admin/products";
            }
            Category category = categoryService.findById(product.getCategory().getId());
            if (category == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Danh mục không tồn tại!");
                return "redirect:/admin/products";
            }
            product.setCategory(category);
            com.ecommerce.pojo.Store store = storeService.findById(product.getStore().getId());
            if (store == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Cửa hàng không tồn tại!");
                return "redirect:/admin/products";
            }
            product.setStore(store);
            if (image != null && !image.isEmpty()) {
                String imagePath = saveProductImage(image);
                product.setImage(imagePath);
            }
            Product savedProduct = productService.save(product);
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductAdded(
                            currentUser.getFullname(),
                            currentUser.getEmail(),
                            savedProduct.getId(),
                            savedProduct.getName(),
                            ipAddress);
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
    }

    @PostMapping("/products/edit/{id}")
    public String updateProduct(@AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @ModelAttribute Product product,
            @RequestParam Long categoryId,
            @RequestParam(required = false) Long storeId,
            @RequestParam(value = "imageFile", required = false) MultipartFile image,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        try {
            Product existingProduct = productService.findById(id);
            if (existingProduct == null) {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy sản phẩm!");
                return "redirect:/admin/products";
            }
            existingProduct.setName(product.getName());
            existingProduct.setDescription(product.getDescription());
            existingProduct.setPrice(product.getPrice());
            existingProduct.setQuantity(product.getQuantity());
            existingProduct.setActive(product.isActive());
            Category category = categoryService.findById(categoryId);
            if (category != null) {
                existingProduct.setCategory(category);
            }
            if (storeId != null) {
                com.ecommerce.pojo.Store store = storeService.findById(storeId);
                if (store != null) {
                    existingProduct.setStore(store);
                }
            }
            if (image != null && !image.isEmpty()) {
                String imagePath = saveProductImage(image);
                existingProduct.setImage(imagePath);
            }
            Product updatedProduct = productService.update(existingProduct);
            if (userDetails != null) {
                User currentUser = userService.findByUsername(userDetails.getUsername());
                if (currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logProductUpdated(
                            currentUser.getFullname(),
                            currentUser.getEmail(),
                            updatedProduct.getId(),
                            updatedProduct.getName(),
                            ipAddress);
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

    @GetMapping("/products/activate/{id}")
    public String activateProduct(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Product product = productService.findById(id);
            if (product != null) {
                product.setActive(true);
                productService.update(product);
                redirectAttributes.addFlashAttribute("successMessage", "Sản phẩm đã được kích hoạt thành công.");
            } else {
                redirectAttributes.addFlashAttribute("errorMessage", "Không tìm thấy sản phẩm!");
            }
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi thay đổi trạng thái sản phẩm: " + e.getMessage());
        }
        return "redirect:/admin/products";
    }

    @GetMapping("/products/deactivate/{id}")
    public String deactivateProduct(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            Product product = productService.findById(id);
            if (product != null) {
                product.setActive(false);
                productService.update(product);
                redirectAttributes.addFlashAttribute("successMessage", "Sản phẩm đã bị vô hiệu hóa thành công.");
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

    private String saveProductImage(MultipartFile image) {
        try {
            return productService.uploadProductImage(image);
        } catch (Exception e) {
            logger.error("Error saving product image", e);
            return null;
        }
    }

    @PostMapping("/orders/update-status")
    public String updateOrderStatus(@AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long orderId,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            HttpServletRequest request,
            RedirectAttributes redirectAttributes) {
        try {
            Order order = orderService.findById(orderId);
            if (order != null) {
                String previousStatus = order.getStatus();
                order.setStatus(status);
                Long userId = null;
                User currentUser = null;
                try {
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
                }
                orderService.updateWithoutHistory(order);
                orderService.addOrderStatusHistory(order, status, note, userId);
                if (userDetails != null && currentUser != null) {
                    String ipAddress = IpUtils.getClientIpAddress(request);
                    recentActivityService.logOrderStatusChanged(
                            currentUser.getEmail(),
                            currentUser.getFullname(),
                            order.getId(),
                            status,
                            ipAddress);
                }
                if ("COMPLETED".equals(status)) {
                }
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
        List<OrderStatusHistory> history = orderService.getOrderStatusHistory(id);
        model.addAttribute("order", order);
        model.addAttribute("history", history);
        model.addAttribute("activeMenu", "orders");
        model.addAttribute("content", "order-history :: content");
        return "admin";
    }

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

    @GetMapping("/stores")
    public String manageStores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            Model model) {
        List<Map<String, Object>> allStores = storeService.findAllWithUserInfo();
        if (status != null && !status.isEmpty()) {
            boolean isActive = "active".equals(status);
            allStores = allStores.stream()
                    .filter(store -> (boolean) store.get("active") == isActive)
                    .collect(Collectors.toList());
        }
        if (keyword != null && !keyword.isEmpty()) {
            allStores = allStores.stream()
                    .filter(store -> ((String) store.get("name") != null &&
                            ((String) store.get("name")).toLowerCase().contains(keyword.toLowerCase())) ||
                            ((String) store.get("description") != null &&
                                    ((String) store.get("description")).toLowerCase().contains(keyword.toLowerCase()))
                            ||
                            ((String) store.get("username") != null &&
                                    ((String) store.get("username")).toLowerCase().contains(keyword.toLowerCase())))
                    .collect(Collectors.toList());
        }
        int start = page * size;
        int end = Math.min(start + size, allStores.size());
        List<Map<String, Object>> paginatedStores = allStores.subList(start, end);
        model.addAttribute("stores", paginatedStores);
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", (int) Math.ceil((double) allStores.size() / size));
        model.addAttribute("activeMenu", "stores");
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

    @GetMapping("/seller-requests")
    public String manageSellerRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Model model) {
        try {
            Map<String, Object> paginationResult = sellerRequestService.getSellerRequestsPaginated(
                    page, size, status, sortBy, sortDir);
            @SuppressWarnings("unchecked")
            List<com.ecommerce.dtos.SellerRequestDTO> requests = (List<com.ecommerce.dtos.SellerRequestDTO>) paginationResult
                    .get("content");
            List<Map<String, Object>> requestMaps = requests.stream()
                    .map(dto -> {
                        Map<String, Object> map = new java.util.HashMap<>();
                        map.put("id", dto.getId());
                        map.put("shopName", dto.getShopName());
                        map.put("description", dto.getDescription());
                        map.put("status", dto.getStatus());
                        map.put("createdDate", dto.getCreatedDate());
                        map.put("sellerType", dto.getSellerType());
                        map.put("userId", dto.getUserId());
                        map.put("username", dto.getUsername());
                        map.put("fullname", dto.getFullname());
                        map.put("email", dto.getEmail());
                        map.put("displayStatus", dto.getDisplayStatus());
                        map.put("daysSinceCreated", dto.getDaysSinceCreated());
                        map.put("isPending", dto.isPending());
                        map.put("isApproved", dto.isApproved());
                        map.put("isRejected", dto.isRejected());
                        map.put("formattedCreatedDate", dto.getFormattedCreatedDate());
                        map.put("isOverdue", dto.isOverdue());
                        map.put("priorityLevel", dto.getPriorityLevel());
                        map.put("statusBadgeClass", dto.getStatusBadgeClass());
                        return map;
                    })
                    .collect(Collectors.toList());
            model.addAttribute("requests", requestMaps);
            model.addAttribute("currentPage", paginationResult.get("currentPage"));
            model.addAttribute("totalPages", paginationResult.get("totalPages"));
            model.addAttribute("totalElements", paginationResult.get("totalElements"));
            model.addAttribute("hasNext", paginationResult.get("hasNext"));
            model.addAttribute("hasPrevious", paginationResult.get("hasPrevious"));
            model.addAttribute("first", paginationResult.get("first"));
            model.addAttribute("last", paginationResult.get("last"));
            model.addAttribute("currentStatus", status);
            model.addAttribute("currentSortBy", sortBy);
            model.addAttribute("currentSortDir", sortDir);
            @SuppressWarnings("unchecked")
            Map<String, Long> statusCounts = (Map<String, Long>) paginationResult.get("statusCounts");
            model.addAttribute("statusCounts", statusCounts);
        } catch (Exception e) {
            logger.error("Error using new pagination method, falling back to old method", e);
            List<Map<String, Object>> allRequests = userService.findAllSellerRequests();
            if (status != null && !status.isEmpty()) {
                allRequests = allRequests.stream()
                        .filter(request -> status.equals(request.get("status")))
                        .collect(Collectors.toList());
            }
            int start = page * size;
            int end = Math.min(start + size, allRequests.size());
            List<Map<String, Object>> paginatedRequests = allRequests.subList(start, end);
            model.addAttribute("requests", paginatedRequests);
            model.addAttribute("currentPage", page);
            model.addAttribute("totalPages", (int) Math.ceil((double) allRequests.size() / size));
        }
        model.addAttribute("activeMenu", "sellerRequests");
        model.addAttribute("content", "seller-requests :: content");
        return "admin";
    }

    @PostMapping("/seller-requests/approve/{id}")
    public String approveSellerRequest(@PathVariable Long id,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal UserDetails userDetails,
            RedirectAttributes redirectAttributes) {
        try {
            String adminUsername = userDetails.getUsername();
            sellerRequestService.approveRequest(id, adminUsername, notes);
            redirectAttributes.addFlashAttribute("successMessage",
                    "Đã phê duyệt yêu cầu trở thành người bán thành công!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi phê duyệt yêu cầu: " + e.getMessage());
        }
        return "redirect:/admin/seller-requests";
    }

    @PostMapping("/seller-requests/reject/{id}")
    public String rejectSellerRequest(
            @PathVariable Long id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetails userDetails,
            RedirectAttributes redirectAttributes) {
        try {
            String adminUsername = userDetails.getUsername();
            sellerRequestService.rejectRequest(id, adminUsername, reason);
            redirectAttributes.addFlashAttribute("successMessage",
                    "Đã từ chối yêu cầu trở thành người bán!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage",
                    "Lỗi khi từ chối yêu cầu: " + e.getMessage());
        }
        return "redirect:/admin/seller-requests";
    }
}
