package com.ecommerce.controllers;

import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import com.ecommerce.services.SellerRequestService;
import com.ecommerce.services.UserService;
import com.ecommerce.utils.JwtUtils;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class ApiSellerController {

    @Autowired
    private SellerRequestService sellerRequestService;

    @Autowired
    private UserService userService;

    /**
     * Đăng ký làm người bán (SELLER)
     */
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> registerSeller(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "idCardFront", required = false) MultipartFile idCardFront,
            @RequestParam(value = "idCardBack", required = false) MultipartFile idCardBack,
            @RequestParam(value = "businessLicense", required = false) MultipartFile businessLicense,
            HttpServletRequest request) {

        try {
            // Lấy thông tin người dùng hiện tại
            User currentUser = findUserFromRequest(request);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."));
            }

            // Kiểm tra nếu người dùng đã là SELLER
            boolean isSeller = false;
            if (currentUser.getRoles() != null) {
                for (var role : currentUser.getRoles()) {
                    if (role.getName().equals("SELLER")) {
                        isSeller = true;
                        break;
                    }
                }
            }

            if (isSeller) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Bạn đã là người bán."));
            }

            // Đăng ký làm người bán
            SellerRequest sellerRequest = sellerRequestService.registerSeller(
                    currentUser,
                    params,
                    idCardFront,
                    idCardBack,
                    businessLicense);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Yêu cầu đăng ký đã được gửi thành công. Vui lòng đợi phê duyệt.",
                    "request", sellerRequest));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi đăng ký: " + e.getMessage()));
        }
    }

    /**
     * Kiểm tra trạng thái đăng ký người bán
     */
    @GetMapping("/request-status")
    public ResponseEntity<?> checkRequestStatus(HttpServletRequest request) {
        try {
            User currentUser = findUserFromRequest(request);

            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin người dùng."));
            }

            String status = sellerRequestService.getRequestStatus(currentUser);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("status", status != null ? status : "");

            // Nếu trạng thái là REJECTED, thêm lý do từ chối
            if (status != null && status.equals("REJECTED")) {
                // Lấy yêu cầu bị từ chối gần nhất
                List<SellerRequest> requests = sellerRequestService.findByStatus("REJECTED");
                for (SellerRequest req : requests) {
                    if (req.getUser().getId().equals(currentUser.getId())) {
                        response.put("rejectionReason", req.getStatusNotes());
                        break;
                    }
                }
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi kiểm tra trạng thái: " + e.getMessage()));
        }
    }
     

    /**
     * Lấy danh sách tất cả các yêu cầu đăng ký
     * Chỉ ADMIN hoặc STAFF mới có quyền truy cập
     */
    @GetMapping("/requests")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF')")
    public ResponseEntity<?> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        try {
            List<SellerRequest> requests;

            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                requests = sellerRequestService.findByStatus(status);
            } else {
                requests = sellerRequestService.findAll();
            }

            // Tính toán phân trang
            int totalElements = requests.size();
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, totalElements);

            // Xử lý trường hợp index ngoài giới hạn
            if (fromIndex >= totalElements) {
                fromIndex = 0;
                toIndex = Math.min(size, totalElements);
            }

            List<SellerRequest> pagedRequests = fromIndex < toIndex
                    ? requests.subList(fromIndex, toIndex)
                    : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("content", pagedRequests);
            response.put("totalElements", totalElements);
            response.put("totalPages", (int) Math.ceil((double) totalElements / size));
            response.put("currentPage", page);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lấy danh sách yêu cầu: " + e.getMessage()));
        }
    }

    /**
     * Lấy chi tiết một yêu cầu đăng ký
     * Chỉ ADMIN hoặc STAFF mới có quyền truy cập
     */
    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF')")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        try {
            SellerRequest request = sellerRequestService.findById(id);

            if (request == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy yêu cầu với ID: " + id));
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "request", request));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lấy thông tin yêu cầu: " + e.getMessage()));
        }
    }

    /**
     * Phê duyệt yêu cầu đăng ký
     * Chỉ ADMIN hoặc STAFF mới có quyền truy cập
     */
    @PutMapping("/requests/{id}/approve")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF')")
    public ResponseEntity<?> approveRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> data,
            HttpServletRequest request) {

        try {
            User admin = findUserFromRequest(request);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin người dùng."));
            }

            String notes = data != null ? data.get("notes") : null;

            SellerRequest approvedRequest = sellerRequestService.approveRequest(id, admin.getUsername(), notes);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Yêu cầu đã được phê duyệt thành công.",
                    "request", approvedRequest));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi phê duyệt yêu cầu: " + e.getMessage()));
        }
    }

    /**
     * Từ chối yêu cầu đăng ký
     * Chỉ ADMIN hoặc STAFF mới có quyền truy cập
     */
    @PutMapping("/requests/{id}/reject")
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('STAFF')")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> data,
            HttpServletRequest request) {

        try {
            User admin = findUserFromRequest(request);

            if (admin == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin người dùng."));
            }

            if (data == null || !data.containsKey("reason") || data.get("reason").isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Lý do từ chối không được để trống."));
            }

            String reason = data.get("reason");

            SellerRequest rejectedRequest = sellerRequestService.rejectRequest(id, admin.getUsername(), reason);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Yêu cầu đã bị từ chối.",
                    "request", rejectedRequest));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi từ chối yêu cầu: " + e.getMessage()));
        }
    }

    /**
     * Phương thức trợ giúp mới để tìm thông tin người dùng từ nhiều nguồn
     */
    private User findUserFromRequest(HttpServletRequest request) {
        // 1. Thử lấy từ Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            System.out.println("Getting user from SecurityContext: " + authentication.getName());
            User user = userService.findByUsername(authentication.getName());
            if (user != null) {
                return user;
            }
        }

        // 2. Thử lấy từ request attribute (được thiết lập bởi JWT filter)
        String jwtUsername = (String) request.getAttribute("jwt_username");
        if (jwtUsername != null) {
            System.out.println("Getting user from request attribute: " + jwtUsername);
            User user = userService.findByUsername(jwtUsername);
            if (user != null) {
                return user;
            }
        }

        // 3. Thử lấy từ Authorization header
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                String username = JwtUtils.extractUsername(token);
                if (username != null) {
                    System.out.println("Getting user from JWT token: " + username);
                    return userService.findByUsername(username);
                }
            } catch (Exception e) {
                System.out.println("Error extracting username from token: " + e.getMessage());
            }
        }

        return null;
    }
}
