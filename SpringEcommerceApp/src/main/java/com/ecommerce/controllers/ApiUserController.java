package com.ecommerce.controllers;

import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;
import com.ecommerce.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
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

    @Autowired
    private UserService userService;

    @GetMapping("")
    public List<User> getAllUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable("id") Long id) {
        return userService.findById(id);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestParam Map<String, String> params,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        try {
            // Kiểm tra username/email đã tồn tại
            if (userService.findByUsername(params.get("username")) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Username already exists"));
            }
            if (userService.findByEmail(params.get("email")) != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Email already exists"));
            }
            User user = userService.addUser(params, avatar);
            return ResponseEntity.ok(Map.of("success", true, "message", "Register success", "user", user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", "Register failed: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/login", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_FORM_URLENCODED_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE})
    @CrossOrigin
    public ResponseEntity<?> login(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            @RequestBody(required = false) LoginRequest loginRequestBody
    ) {
        try {
            String loginUsername = username;
            String loginPassword = password;
            
            // Nếu body JSON được gửi, ưu tiên dùng nó
            if (loginRequestBody != null) {
                loginUsername = loginRequestBody.username;
                loginPassword = loginRequestBody.password;
            }
            
            // Kiểm tra nếu cả hai cách đều không có dữ liệu
            if (loginUsername == null && loginPassword == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new AuthResponse(false, "Missing username or password", null, null));
            }
            
            User user = userService.findByUsername(loginUsername);
            if (user == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, "User not found", null, null));
            boolean authenticated = userService.authenticate(loginUsername, loginPassword);
            if (!authenticated)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new AuthResponse(false, "Invalid credentials", null, null));
            
            // Sử dụng phương thức static
            String token = JwtUtils.generateToken(user.getUsername());
            
            return ResponseEntity.ok(new AuthResponse(true, "Login success", token, user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new AuthResponse(false, "Login failed: " + e.getMessage(), null, null));
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
}
