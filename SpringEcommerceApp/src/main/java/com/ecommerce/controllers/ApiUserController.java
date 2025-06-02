package com.ecommerce.controllers;
import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;
import com.ecommerce.services.RecentActivityService;
import com.ecommerce.utils.JwtUtils;
import com.ecommerce.utils.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.Date;
import java.util.Base64;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
@RestController
@RequestMapping("/api")

public class ApiUserController {
    public static class LoginRequest {
        public String username;
        public String password;
    }
    public static class AuthResponse {
        public boolean success;
        public String message;
        public String token;
        public User user;
        public AuthResponse(boolean success, String message, String token, User user) {
            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }
    }
    public static class PasswordChangeRequest {
        public String currentPassword;
        public String newPassword;
    }    @Autowired
    private UserService userService;
    @Autowired
    private RecentActivityService recentActivityService;
    @Autowired
    private Cloudinary cloudinary;
    @GetMapping("")
    public List<User> getAllUsers() {
        return userService.findAll();
    }
    @GetMapping("/{id}")
    public User getUserById(@PathVariable("id") Long id) {
        return userService.findById(id);
    }    @PostMapping("/register")
   
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> params, HttpServletRequest request) {
        try {
            System.out.println("=== REGISTER DEBUG ===");
            System.out.println("Đã nhận request đăng ký dạng JSON");
            System.out.println("Params: " + params);
            String username = params.get("username");
            String email = params.get("email");
            String password = params.get("password");
            String avatar = params.get("avatar");
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Username không được để trống"));
            }
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Email không được để trống"));
            }
            if (password == null || password.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Password không được để trống"));
            }
            if (userService.findByUsername(username) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Username đã tồn tại"));
            }
            if (userService.findByEmail(email) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Email đã tồn tại"));
            }
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            if (avatar != null && !avatar.isEmpty()) {
                try {
                    String base64Image = avatar;
                    if (avatar.contains(",")) {
                        base64Image = avatar.split(",")[1];
                    }
                    byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                    @SuppressWarnings("unchecked")
                    Map<String, Object> uploadResult = cloudinary.uploader().upload(
                            imageBytes,
                            ObjectUtils.asMap(
                                    "folder", "ecommerce/avatars",
                                    "resource_type", "auto"));
                    user.setAvatar((String) uploadResult.get("secure_url"));
                } catch (Exception e) {
                    e.printStackTrace();
                    System.err.println("Failed to upload avatar: " + e.getMessage());
                }
            }            User savedUser = userService.addUser(user);
            String ipAddress = IpUtils.getClientIpAddress(request);
            recentActivityService.logUserRegistration(savedUser.getEmail(), savedUser.getUsername(), ipAddress);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đăng ký thành công", "user", savedUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi đăng ký: " + e.getMessage()));
        }
    }    @PostMapping(value = "/register-with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    
    public ResponseEntity<?> registerUserWithFile(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(name = "avatar", required = false) MultipartFile avatar,
            HttpServletRequest request) {
        try {
            System.out.println("=== REGISTER WITH FILE DEBUG ===");
            if (username == null || username.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Username không được để trống"));
            }
            if (email == null || email.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Email không được để trống"));
            }
            if (password == null || password.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Password không được để trống"));
            }
            if (userService.findByUsername(username) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Username đã tồn tại"));
            }
            if (userService.findByEmail(email) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "Email đã tồn tại"));
            }
            Map<String, String> params = new HashMap<>();
            params.put("username", username);
            params.put("email", email);
            params.put("password", password);
            User savedUser = userService.addUser(params, avatar);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đăng ký thành công", "user", savedUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Lỗi đăng ký: " + e.getMessage()));
        }
    }    @PostMapping(value = "/login", consumes = { MediaType.APPLICATION_JSON_VALUE,
            MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE })
    @CrossOrigin
    public ResponseEntity<?> login(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            @RequestBody(required = false) LoginRequest loginRequestBody,
            HttpServletRequest request) {
        try {
            System.out.println("=== LOGIN DEBUG ===");
            String loginUsername = username;
            String loginPassword = password;
            if (loginRequestBody != null) {
                System.out.println("Login với JSON body");
                loginUsername = loginRequestBody.username;
                loginPassword = loginRequestBody.password;
            } else {
                System.out.println("Login với form parameters");
            }
            System.out.println("Login attempt - Username: " + loginUsername);
            if (loginUsername == null || loginPassword == null) {
                System.out.println("ERROR: Missing username or password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new AuthResponse(false, "Tên đăng nhập hoặc mật khẩu không được để trống", null, null));
            }
            try {
                boolean authenticated = userService.authenticate(loginUsername, loginPassword);
                if (!authenticated) {
                    System.out.println("ERROR: Authentication failed for user: " + loginUsername);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new AuthResponse(false, "Tên đăng nhập hoặc mật khẩu không chính xác", null, null));
                }
                User user = userService.findByUsername(loginUsername);
                if (user == null) {
                    System.out.println("ERROR: User authenticated but not found: " + loginUsername);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new AuthResponse(false, "Lỗi hệ thống: User không tồn tại sau khi xác thực", null,
                                    null));
                }
                user.setLastLogin(new Date());
                userService.update(user);
                String ipAddress = IpUtils.getClientIpAddress(request);
                recentActivityService.logUserLogin(user.getEmail(), user.getUsername(), ipAddress);
                String token = JwtUtils.generateToken(user.getUsername());
                System.out.println("Login SUCCESS for user: " + loginUsername);
                return ResponseEntity.ok(new AuthResponse(true, "Đăng nhập thành công", token, user));
            } catch (Exception e) {
                System.err.println("ERROR during authentication: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new AuthResponse(false, "Lỗi xác thực: " + e.getMessage(), null, null));
            }
        } catch (Exception e) {
            System.err.println("ERROR in login endpoint: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthResponse(false, "Lỗi đăng nhập: " + e.getMessage(), null, null));
        }
    }
    @PutMapping("/{id}")
    public void updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);
        userService.update(user);
    }
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.delete(id);
    }
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();
            User currentUser = userService.findByUsername(currentUsername);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Not authenticated or user not found"));
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "user", currentUser));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to retrieve profile: " + e.getMessage()));
        }
    }
    @PutMapping("/profile")
    
    public ResponseEntity<?> updateProfile(
            @RequestParam(required = false) Map<String, String> params,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            HttpServletRequest request) {
        try {
            System.out.println("Update profile request: " + request.getRequestURI());
            System.out.println("Authorization header: " + request.getHeader("Authorization"));
            User currentUser = findUserFromRequest(request);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."));
            }
            System.out.println("Found user: " + currentUser.getUsername());
            updateUserInfo(params, avatar, currentUser);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cập nhật thông tin thành công!",
                    "user", currentUser));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi cập nhật thông tin: " + e.getMessage()));
        }
    }
    private void updateUserInfo(Map<String, String> params, MultipartFile avatar, User currentUser) throws Exception {
        if (params != null) {
            if (params.containsKey("fullname")) {
                currentUser.setFullname(params.get("fullname"));
            }
            if (params.containsKey("email") && !params.get("email").equals(currentUser.getEmail())) {
                User existingUser = userService.findByEmail(params.get("email"));
                if (existingUser != null && !existingUser.getId().equals(currentUser.getId())) {
                    throw new RuntimeException("Email already exists");
                }
                currentUser.setEmail(params.get("email"));
            }
            if (params.containsKey("phone")) {
                currentUser.setPhone(params.get("phone"));
            }
        }
        if (avatar != null && !avatar.isEmpty()) {
            userService.updateAvatar(currentUser, avatar);
        }
        userService.update(currentUser);
    }
    @PutMapping("/profile/password")
    
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request,
            HttpServletRequest httpRequest) {
        try {
            System.out.println("Change password request: " + httpRequest.getRequestURI());
            System.out.println("Authorization header: " + httpRequest.getHeader("Authorization"));
            User currentUser = findUserFromRequest(httpRequest);
            if (currentUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "success", false,
                        "message", "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại."));
            }
            System.out.println("Found user for password change: " + currentUser.getUsername());
            if (!userService.authenticate(currentUser.getUsername(), request.currentPassword)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "success", false,
                        "message", "Mật khẩu hiện tại không chính xác"));
            }
            userService.changePassword(currentUser, request.newPassword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đổi mật khẩu thành công!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi đổi mật khẩu: " + e.getMessage()));
        }
    }
    private User findUserFromRequest(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getName() != null) {
            System.out.println("Getting user from SecurityContext: " + authentication.getName());
            User user = userService.findByUsername(authentication.getName());
            if (user != null) {
                return user;
            }
        }
        String jwtUsername = (String) request.getAttribute("jwt_username");
        if (jwtUsername != null) {
            System.out.println("Getting user from request attribute: " + jwtUsername);
            User user = userService.findByUsername(jwtUsername);
            if (user != null) {
                return user;
            }
        }
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
    @PostMapping("/clear-cache/{username}")
    public ResponseEntity<?> clearUserCache(@PathVariable String username) {
        try {
            userService.clearUserCache(username);
            return ResponseEntity.ok(Map.of("success", true, "message", "Cache cleared for user: " + username));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error clearing cache: " + e.getMessage()));
        }
    }
    @PostMapping("/clear-all-cache")
    public ResponseEntity<?> clearAllCache() {
        try {
            List<User> allUsers = userService.findAll();
            for (User user : allUsers) {
                userService.clearUserCache(user.getUsername());
            }
            return ResponseEntity.ok(Map.of("success", true, "message", "All user caches cleared successfully"));        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error clearing all caches: " + e.getMessage()));
    }
    }
      @GetMapping("/users/search")
    
    public ResponseEntity<?> searchUsers(@RequestParam String q) {
        try {
            System.out.println("=== USER SEARCH DEBUG ===");
            System.out.println("Search query: " + q);
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Search query cannot be empty"));
            }
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = null;
            if (authentication != null && authentication.isAuthenticated()) {
                currentUsername = authentication.getName();
            }
            List<User> users = userService.searchUsers(q);
            if (currentUsername != null) {
                final String username = currentUsername;                users = users.stream()
                        .filter(user -> !username.equals(user.getUsername()))
                        .collect(java.util.stream.Collectors.toList());
            }
            if (users.size() > 20) {
                users = users.subList(0, 20);
            }
            List<Map<String, Object>> userResponse = users.stream()
                    .map(user -> {
                        Map<String, Object> userMap = new HashMap<>();
                        userMap.put("id", user.getId());
                        userMap.put("username", user.getUsername());
                        userMap.put("fullname", user.getFullname());
                        userMap.put("avatar", user.getAvatar());                        return userMap;
                    })
                    .collect(java.util.stream.Collectors.toList());
            System.out.println("Found " + userResponse.size() + " users");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "users", userResponse,
                "count", userResponse.size()
            ));
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error searching users: " + e.getMessage()));
        }
    }
}
