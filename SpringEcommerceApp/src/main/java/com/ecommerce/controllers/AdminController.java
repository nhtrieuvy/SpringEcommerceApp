package com.ecommerce.controllers;

import com.ecommerce.pojo.Role;
import com.ecommerce.pojo.User;
import com.ecommerce.services.RoleService;
import com.ecommerce.services.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    // API để lấy danh sách người dùng với phân trang và lọc
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "ALL") String status
    ) {
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
            //     user.setPassword(null); // Không trả về mật khẩu
            // }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", users);
            response.put("currentPage", page);
            response.put("totalElements", totalUsers);
            response.put("totalPages", (int) Math.ceil((double) totalUsers / size));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi lấy danh sách người dùng: " + e.getMessage()));
        }
    }

    // API để lấy thông tin chi tiết của một người dùng
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi lấy thông tin người dùng: " + e.getMessage()));
        }
    }

    // API để cập nhật thông tin người dùng (bao gồm kích hoạt/khóa tài khoản)
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User user = userService.findById(id);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Không tìm thấy người dùng với ID: " + id));
            }            // Cập nhật trạng thái hoạt động
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
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi cập nhật thông tin người dùng: " + e.getMessage()));
        }
    }

    // API để lấy danh sách tất cả các quyền
    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllRoles() {
        try {
            List<Role> roles = roleService.findAll();
            List<Map<String, Object>> roleDetails = new ArrayList<>();

            for (Role role : roles) {
                Map<String, Object> roleMap = new HashMap<>();
                roleMap.put("id", role.getId());
                roleMap.put("name", role.getName());
                roleMap.put("description", getDescriptionForRole(role.getName()));
                roleDetails.add(roleMap);
            }

            return ResponseEntity.ok(Map.of("success", true, "roles", roleDetails));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi khi lấy danh sách quyền: " + e.getMessage()));
        }
    }

    // API để cập nhật quyền cho người dùng
    @PutMapping("/users/{userId}/roles")
    @PreAuthorize("hasRole('ADMIN')")
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
            
            
            // Xóa tất cả quyền hiện tại
            user.setRoles(new HashSet<>());            
            
            // Thêm quyền mới - chuyển đổi từng phần tử của danh sách sang Long
            for (Object roleIdObj : roleIdsObj) {
                // Chuyển đổi an toàn từ Integer hoặc Long sang Long
                Long roleId = null;
                
                try {
                    if (roleIdObj instanceof Integer) {
                        roleId = Long.valueOf(((Integer) roleIdObj).longValue());
                    } else if (roleIdObj instanceof Long) {
                        roleId = (Long) roleIdObj;
                    } else if (roleIdObj instanceof String) {
                        roleId = Long.parseLong((String) roleIdObj);
                    } else if (roleIdObj instanceof Number) {
                        roleId = ((Number) roleIdObj).longValue();
                    } else {
                        System.err.println("Không thể xác định kiểu dữ liệu của roleId: " + roleIdObj + " - loại: " + 
                                         (roleIdObj != null ? roleIdObj.getClass().getName() : "null"));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    System.err.println("Không thể chuyển đổi sang Long: " + roleIdObj);
                    continue;
                } catch (Exception e) {
                    System.err.println("Lỗi khi xử lý roleId: " + e.getMessage());
                    continue;
                }
                
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
            e.printStackTrace();
            System.err.println("Chi tiết lỗi khi cập nhật quyền: " + e);
            System.err.println("RoleIds được gửi: " + request.get("roleIds"));
            
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
    @PreAuthorize("hasRole('ADMIN')")
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

            // Xóa quyền
            Set<Role> userRoles = user.getRoles();
            userRoles.removeIf(r -> r.getId().equals(roleId));
            user.setRoles(userRoles);
            userService.update(user);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa quyền thành công"));
        } catch (Exception e) {
            e.printStackTrace();
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
}
