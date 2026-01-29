package com.ecommerce.controllers;

import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.Role;
import com.ecommerce.pojo.Store;
import com.ecommerce.pojo.User;
import com.ecommerce.services.ProductService;
import com.ecommerce.services.RoleService;
import com.ecommerce.services.StoreService;
import com.ecommerce.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class ApiAdminController {
    private static final Logger logger = LoggerFactory.getLogger(ApiAdminController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private ProductService productService;

    @Autowired
    private StoreService storeService; // API để lấy danh sách người dùng với phân trang và lọc

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String status) {
        try {
            List<User> users;
            long totalUsers;

            // Lọc theo trạng thái
            if ("ALL".equals(status)) {
                users = userService.findAll();
                totalUsers = users.size();

                // Phân trang thủ công
                int start = page * size;
                int end = Math.min(start + size, users.size());
                users = users.subList(start, end);
            } else {
                boolean isActive = "ACTIVE".equals(status);
                users = userService.findByActiveStatus(isActive);
                totalUsers = users.size();

                // Phân trang thủ công
                int start = page * size;
                int end = Math.min(start + size, users.size());
                users = users.subList(start, end);
            }

            // Chuẩn bị response
            // for (User user : users) {
            // user.setPassword(null); // Không trả về mật khẩu
            // }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", users);
            response.put("currentPage", page);
            response.put("totalElements", totalUsers);
            response.put("totalPages", (int) Math.ceil((double) totalUsers / size));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error getting users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi lấy danh sách người dùng: " + e.getMessage()));
        }
    }

    // API để lấy thông tin chi tiết của một người dùng @GetMapping("/users/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.findById(id);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy người dùng với ID: " + id));
            }

            // user.setPassword(null); // Không trả về mật khẩu
            return ResponseEntity.ok(Map.of("success", true, "user", user));
        } catch (Exception e) {
            logger.error("Error getting user by id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }
    } // API để cập nhật thông tin người dùng (bao gồm kích hoạt/khóa tài khoản)

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User user = userService.findById(id);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy người dùng với ID: " + id));
            }

            // Cập nhật trạng thái hoạt động
            if (updates.containsKey("isActive")) {
                boolean isActive = (boolean) updates.get("isActive");
                user.setActive(isActive);
            } else if (updates.containsKey("active")) {
                boolean active = (boolean) updates.get("active");
                user.setActive(active);
            }

            // Cập nhật thông tin khác nếu cần
            if (updates.containsKey("fullname")) {
                user.setFullname((String) updates.get("fullname"));
            }

            if (updates.containsKey("email")) {
                user.setEmail((String) updates.get("email"));
            }

            if (updates.containsKey("phone")) {
                user.setPhone((String) updates.get("phone"));
            }

            userService.update(user);

            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật thông tin người dùng thành công"));
        } catch (Exception e) {
            logger.error("Error updating user: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message",
                            "Lỗi khi cập nhật thông tin người dùng: " + e.getMessage()));
        }
    } // API để lấy danh sách tất cả các quyền

    @GetMapping("/roles")
    public ResponseEntity<?> getAllRoles() {
        try {
            List<Role> roles = roleService.findAll();
            List<Map<String, Object>> roleDetails = new ArrayList<>();

            // Kiểm tra nếu người dùng hiện tại là STAFF
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();

            boolean isStaff = false;
            if (authentication != null) {
                isStaff = authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("STAFF")) &&
                        !authentication.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
            }

            for (Role role : roles) {
                // Nếu là nhân viên (STAFF) thì không hiển thị quyền ADMIN
                if (isStaff && "ADMIN".equals(role.getName())) {
                    continue;
                }

                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("name", role.getName());
                roleMap.put("description", getDescriptionForRole(role.getName()));
                roleDetails.add(roleMap);
            }

            return ResponseEntity.ok(Map.of("success", true, "roles", roleDetails));
        } catch (Exception e) {
            logger.error("Error getting roles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi lấy danh sách quyền: " + e.getMessage()));
        }
    }

    // API để cập nhật quyền cho người dùng
    @PutMapping("/users/{userId}/roles")
    public ResponseEntity<?> updateUserRoles(@PathVariable Long userId, @RequestBody Map<String, Object> request) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy người dùng với ID: " + userId));
            }

            List<?> roleIdsObj = (List<?>) request.get("roleIds");
            if (roleIdsObj == null || roleIdsObj.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Danh sách quyền không được để trống"));
            }

            // Kiểm tra nếu người dùng hiện tại là STAFF và cố gắng cấp quyền ADMIN cho
            // người khác
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();

            // Nếu không có authentication, từ chối yêu cầu
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Yêu cầu xác thực"));
            }

            boolean isStaff = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")) &&
                    !authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isStaff) {
                // Kiểm tra nếu người dùng đang chỉnh sửa có vai trò ADMIN
                boolean userHasAdminRole = false;
                if (user.getRoles() != null) {
                    for (Role existingRole : user.getRoles()) {
                        if ("ADMIN".equals(existingRole.getName())) {
                            userHasAdminRole = true;
                            break;
                        }
                    }
                }

                // Nhân viên không được phép thao tác với người dùng có quyền ADMIN
                if (userHasAdminRole) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("success", false,
                                    "message",
                                    "Nhân viên không có quyền thay đổi quyền của người dùng có quyền ADMIN"));
                }

                // Kiểm tra xem danh sách quyền có chứa quyền ADMIN không
                boolean containsAdminRole = false;
                for (Object roleIdObj : roleIdsObj) {
                    Long roleId = convertToLong(roleIdObj);
                    if (roleId != null) {
                        Role role = roleService.findById(roleId);
                        if (role != null && "ADMIN".equals(role.getName())) {
                            containsAdminRole = true;
                            break;
                        }
                    }
                }

                // Nhân viên không được phép thêm quyền ADMIN cho bất kỳ ai
                if (containsAdminRole) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("success", false,
                                    "message", "Nhân viên không có quyền cấp quyền ADMIN cho người dùng"));
                }
            }

            // Xóa tất cả quyền hiện tại
            user.setRoles(new HashSet<>());

            // Thêm quyền mới - chuyển đổi từng phần tử của danh sách sang Long
            for (Object roleIdObj : roleIdsObj) {
                Long roleId = convertToLong(roleIdObj);

                if (roleId != null) {
                    Role role = roleService.findById(roleId);
                    if (role != null) {
                        userService.addRoleToUser(user, role);
                    }
                }
            }

            // Xóa cache để đảm bảo dữ liệu mới nhất
            if (user != null && user.getUsername() != null) {
                userService.clearUserCache(user.getUsername());
            }

            return ResponseEntity.ok(Map.of("success", true, "message", "Cập nhật quyền cho người dùng thành công"));
        } catch (Exception e) {
            logger.error("Chi tiết lỗi khi cập nhật quyền", e);
            logger.error("RoleIds được gửi: {}", request.get("roleIds"));

            // Trả về chi tiết lỗi để dễ khắc phục
            String errorMsg = "Lỗi khi cập nhật quyền cho người dùng: ";
            if (e instanceof RuntimeException && e.getMessage() != null) {
                errorMsg += e.getMessage();
            } else {
                errorMsg += "Không thể cập nhật quyền. Có thể do lỗi mất kết nối với cơ sở dữ liệu.";
                if (e.getMessage() != null) {
                    errorMsg += " Chi tiết: " + e.getMessage();
                }
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", errorMsg));
        }
    }

    // Xóa quyền của người dùng
    @DeleteMapping("/users/{userId}/roles/{roleId}")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Long userId, @PathVariable Long roleId) {
        try {
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy người dùng với ID: " + userId));
            }

            Role role = roleService.findById(roleId);
            if (role == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy quyền với ID: " + roleId));
            }

            // Kiểm tra nếu người dùng hiện tại là STAFF và cố gắng xóa quyền ADMIN
            org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                    .getContext().getAuthentication();

            // Nếu không có authentication, từ chối yêu cầu
            if (authentication == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "Yêu cầu xác thực"));
            }

            boolean isStaff = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF")) &&
                    !authentication.getAuthorities().stream()
                            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            // Nếu là nhân viên, không được xóa quyền ADMIN và không được sửa người dùng có
            // quyền ADMIN
            if (isStaff) {
                // Kiểm tra xem vai trò cần xóa có phải ADMIN không
                if ("ADMIN".equals(role.getName())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("success", false,
                                    "message", "Nhân viên không có quyền xóa quyền ADMIN của người dùng"));
                }

                // Kiểm tra xem người dùng có quyền ADMIN không
                boolean userHasAdminRole = false;
                if (user.getRoles() != null) {
                    for (Role existingRole : user.getRoles()) {
                        if ("ADMIN".equals(existingRole.getName())) {
                            userHasAdminRole = true;
                            break;
                        }
                    }
                }

                // Nếu người dùng có quyền ADMIN, nhân viên không được phép sửa
                if (userHasAdminRole) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("success", false,
                                    "message",
                                    "Nhân viên không có quyền chỉnh sửa quyền của người dùng có quyền ADMIN"));
                }
            }

            // Xóa quyền
            Set<Role> userRoles = user.getRoles();
            userRoles.removeIf(r -> r.getId().equals(roleId));
            user.setRoles(userRoles);
            userService.update(user);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa quyền thành công"));
        } catch (Exception e) {
            logger.error("Error removing role {} from user {}", roleId, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi xóa quyền: " + e.getMessage()));
        }
    }

    // Phương thức hỗ trợ
    private String getDescriptionForRole(String roleName) {
        switch (roleName) {
            case "ADMIN":
                return "Quản trị viên có toàn quyền quản lý hệ thống";
            case "STAFF":
                return "Nhân viên có quyền quản lý nội dung, xét duyệt người bán";
            case "SELLER":
                return "Người bán có quyền đăng sản phẩm và quản lý cửa hàng";
            case "USER":
                return "Người dùng thông thường có thể mua sắm và quản lý tài khoản";
            default:
                return "Vai trò không xác định";
        }
    }

    // API để lấy danh sách người dùng theo vai trò
    @GetMapping("/users/role/{roleName}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String roleName) {
        try {
            List<User> users = userService.findByRole(roleName);

            if (users.isEmpty()) {
                return ResponseEntity.ok(
                        Map.of(
                                "success", true,
                                "message", "Không có người dùng nào có vai trò " + roleName,
                                "content", Collections.emptyList()));
            }

            return ResponseEntity.ok(
                    Map.of(
                            "success", true,
                            "content", users));

        } catch (Exception e) {
            logger.error("Error getting users by role: {}", roleName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lấy danh sách người dùng theo vai trò: " + e.getMessage()));
        }
    }

    // Helper method to convert various types to Long
    private Long convertToLong(Object obj) {
        if (obj == null) {
            return null;
        }

        try {
            if (obj instanceof Integer) {
                return Long.valueOf(((Integer) obj).longValue());
            } else if (obj instanceof Long) {
                return (Long) obj;
            } else if (obj instanceof String) {
                return Long.parseLong((String) obj);
            } else if (obj instanceof Number) {
                return ((Number) obj).longValue();
            }
        } catch (Exception e) {
            logger.warn("Error converting to Long", e);
        }

        return null;
    }

    // Add role-based access control for creating products and stores
    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            productService.save(product);
            return ResponseEntity.ok(Map.of("success", true, "message", "Product created successfully"));
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));

        }
    }

    @PostMapping("/stores")
    public ResponseEntity<?> createStore(@RequestBody Store store) {
        try {
            storeService.save(store);
            return ResponseEntity.ok(Map.of("success", true, "message", "Store created successfully"));
        } catch (Exception e) {

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }

    }

}
