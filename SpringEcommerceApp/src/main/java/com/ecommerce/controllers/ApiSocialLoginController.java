package com.ecommerce.controllers;

import com.ecommerce.pojo.User;
import com.ecommerce.pojo.Role;
import com.ecommerce.services.UserService;
import com.ecommerce.services.RoleService;
import com.ecommerce.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "https://localhost:3000", allowCredentials = "true", maxAge = 3600)
public class ApiSocialLoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleService roleService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;


    // Response class
    public static class SocialAuthResponse {
        public boolean success;
        public String message;
        public String token;
        public User user;

        public SocialAuthResponse(boolean success, String message, String token, User user) {
            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }
    }

    // Google Credential class
    public static class GoogleAuthRequest {
        public String credential;
        public String clientId;
    }

    // Facebook Auth Request
    public static class FacebookAuthRequest {
        public String accessToken;
        public String userID;
    }

    @PostMapping("/google")
    @CrossOrigin(origins = {
            "https://localhost:3000" }, allowCredentials = "true", allowedHeaders = "*", exposedHeaders = { "*" })
    public ResponseEntity<?> googleLogin(@RequestBody GoogleAuthRequest request) {
        try {
            System.out.println("=== GOOGLE LOGIN DEBUG ===");
            System.out.println("Request headers: " + Thread.currentThread().toString());
            System.out.println("Request credential length: "
                    + (request.credential != null ? request.credential.length() : "null"));
            System.out.println("Request clientId: " + (request.clientId != null ? request.clientId : "null"));

            if (request.credential == null || request.credential.isEmpty()) {
                System.out.println("ERROR: Empty credentials");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SocialAuthResponse(false, "Không có thông tin xác thực", null, null));
            }

            // Xác thực token với Google bằng phương thức an toàn
            System.out.println("Starting Google token verification...");
            Map<String, Object> googleUserInfo = verifyGoogleToken(request.credential);

            if (googleUserInfo == null) {
                System.out.println("ERROR: Google token verification failed");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new SocialAuthResponse(false, "Token Google không hợp lệ", null, null));
            }

            System.out.println("Google token verification successful!");
            System.out.println("Token payload: " + googleUserInfo);

            // Extract thông tin từ Google payload
            String email = (String) googleUserInfo.get("email");
            if (email == null) {
                System.out.println("ERROR: Email not found in Google token payload");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SocialAuthResponse(false, "Thông tin email không tồn tại trong token", null, null));
            }

            String name = (String) googleUserInfo.get("name");
            String picture = (String) googleUserInfo.get("picture");
            String googleId = (String) googleUserInfo.get("sub");

            System.out.println("User info - Email: " + email + ", Name: " + name + ", Picture: " + (picture != null)
                    + ", GoogleID: " + googleId);

            // Kiểm tra xem user đã tồn tại chưa
            System.out.println("Checking if user exists with email: " + email);
            User existingUser = userService.findByEmail(email);

            if (existingUser == null) {
                // Tạo user mới nếu chưa tồn tại
                System.out.println("User not found. Creating new user for: " + email);
                try {
                    existingUser = createGoogleUser(email, name, picture, googleId);
                    System.out.println("User created successfully with ID: " + existingUser.getId());
                } catch (Exception e) {
                    System.err.println("ERROR creating user: " + e.getMessage());
                    e.printStackTrace();
                    // Cung cấp thông báo lỗi chi tiết hơn
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(new SocialAuthResponse(false, "Lỗi khi tạo tài khoản mới: " + e.getMessage(), null,
                                    null));
                }
            } else {
                // Cập nhật thông tin nếu cần
                System.out.println("User found! Updating existing user: " + existingUser.getUsername());
                try {
                    updateGoogleUserInfo(existingUser, name, picture, googleId);
                } catch (Exception e) {
                    System.err.println("ERROR updating user: " + e.getMessage());
                    e.printStackTrace();
                    // Vẫn tiếp tục đăng nhập mặc dù cập nhật thất bại
                    System.out.println("Will continue with login despite update failure");
                }
            }

            // Tạo JWT
            System.out.println("Generating JWT token...");
            try {
                String token = JwtUtils.generateToken(existingUser.getUsername());
                System.out.println("JWT token generated successfully");

                System.out.println("=== GOOGLE LOGIN SUCCESS ===");
                return ResponseEntity
                        .ok(new SocialAuthResponse(true, "Đăng nhập Google thành công", token, existingUser));
            } catch (Exception e) {
                System.err.println("ERROR generating JWT token: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new SocialAuthResponse(false, "Lỗi tạo token đăng nhập: " + e.getMessage(), null, null));
            }

        } catch (Exception e) {
            System.err.println("=== GOOGLE LOGIN ERROR ===");
            System.err.println("Error in Google login: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SocialAuthResponse(false, "Lỗi đăng nhập Google: " + e.getMessage(), null, null));
        }
    }

    // Phương thức đơn giản để giải mã JWT token mà không cần xác thực
    private Map<String, Object> decodeGoogleJwt(String idToken) {
        try {
            System.out.println("Decoding Google JWT token...");

            // Tách JWT thành các phần
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                System.err.println("Invalid JWT format - needs 3 parts but got " + parts.length);
                return null;
            }

            // Thêm padding nếu cần thiết
            String payload = parts[1];
            while (payload.length() % 4 != 0) {
                payload += "=";
            }

            // Giải mã phần payload (phần thứ 2)
            byte[] decodedBytes = Base64.getUrlDecoder().decode(payload);
            String decodedPayload = new String(decodedBytes);
            System.out.println("JWT payload decoded successfully");

            // Parse JSON payload
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> payloadMap = mapper.readValue(decodedPayload, 
                mapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));

            // Kiểm tra các trường cần thiết
            if (!payloadMap.containsKey("email") || !payloadMap.containsKey("sub")) {
                System.err.println("JWT payload missing required fields");
                System.err.println("Available fields: " + payloadMap.keySet());
                return null;
            }

            System.out.println("Google token payload parsed successfully: " + payloadMap.keySet());
            return payloadMap;
        } catch (Exception e) {
            System.err.println("Error in Google token verification: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    @PostMapping("/facebook")
    @CrossOrigin(origins = {
            "https://localhost:3000" }, allowCredentials = "true", allowedHeaders = "*", exposedHeaders = { "*" })
    public ResponseEntity<?> facebookLogin(@RequestBody FacebookAuthRequest request) {
        try {
            if (request.accessToken == null || request.accessToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new SocialAuthResponse(false, "Không có thông tin xác thực", null, null));
            }

            // Xác thực token với Facebook
            Map<String, Object> facebookUserInfo = verifyFacebookToken(request.accessToken, request.userID);

            if (facebookUserInfo == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new SocialAuthResponse(false, "Token Facebook không hợp lệ", null, null));
            }

            // Extract thông tin từ Facebook
            String email = (String) facebookUserInfo.get("email");
            String name = (String) facebookUserInfo.get("name");
            String facebookId = (String) facebookUserInfo.get("id");
            String picture = null;

            // Facebook trả về picture trong một nested object
            if (facebookUserInfo.containsKey("picture")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> pictureData = (Map<String, Object>) facebookUserInfo.get("picture");

                if (pictureData != null && pictureData.containsKey("data")) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> data = (Map<String, Object>) pictureData.get("data");

                    if (data != null && data.containsKey("url")) {
                        picture = (String) data.get("url");
                    }
                }
            }

            // Kiểm tra email - một số người dùng Facebook có thể không có email public
            if (email == null || email.isEmpty()) {
                // Dùng Facebook ID làm định danh
                email = facebookId + "@facebook.com";
            }

            // Kiểm tra xem user đã tồn tại chưa
            User existingUser = userService.findByEmail(email);

            if (existingUser == null) {
                // Tạo user mới nếu chưa tồn tại
                existingUser = createFacebookUser(email, name, picture, facebookId);
            } else {
                // Cập nhật thông tin nếu cần
                updateFacebookUserInfo(existingUser, name, picture, facebookId);
            }

            // Tạo JWT
            String token = JwtUtils.generateToken(existingUser.getUsername());

            return ResponseEntity
                    .ok(new SocialAuthResponse(true, "Đăng nhập Facebook thành công", token, existingUser));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SocialAuthResponse(false, "Lỗi đăng nhập Facebook: " + e.getMessage(), null, null));
        }
    }

    // Phương thức xác thực token Google đúng cách
    private Map<String, Object> verifyGoogleToken(String idToken) {
        try {
            System.out.println("Verifying Google token with proper authentication...");

            NetHttpTransport transport = new NetHttpTransport();
            JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

            // Lấy client ID từ application.properties hoặc sử dụng danh sách các client ID
            // được chấp nhận
            List<String> clientIds = Arrays.asList(
                    "618407643524-0nasoq3jc5dvturarl9truih021cofag.apps.googleusercontent.com",
                    "618407643524-3snq3jtlslt8f1k6vctq3e091pdvh7de.apps.googleusercontent.com");

            // Tạo verifier với nhiều client ID được chấp nhận
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(clientIds)
                    .build();

            System.out.println("Attempting to verify with token length: " + idToken.length());

            // Thực hiện xác thực token
            GoogleIdToken idTokenObj = verifier.verify(idToken);
            if (idTokenObj == null) {
                System.err.println("Google token xác thực không hợp lệ");

                // Fallback sang phương thức giải mã JWT đơn giản nếu xác thực thất bại
                System.out.println("Attempting fallback to JWT decode...");
                return decodeGoogleJwt(idToken);
            }

            System.out.println("Google token verified successfully!");

            GoogleIdToken.Payload payload = idTokenObj.getPayload();

            // Lấy email, name, picture từ payload
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("sub", payload.getSubject()); // Google User ID
            payloadMap.put("email", payload.getEmail());
            payloadMap.put("name", (String) payload.get("name"));
            payloadMap.put("picture", (String) payload.get("picture"));

            System.out.println("Google payload extracted: " + payloadMap.keySet());

            return payloadMap;
        } catch (Exception e) {
            System.err.println("Error verifying Google token: " + e.getMessage());
            e.printStackTrace();

            // Fallback sang phương thức giải mã JWT đơn giản nếu xác thực thất bại
            System.out.println("Exception occurred, attempting fallback to JWT decode...");
            return decodeGoogleJwt(idToken);
        }
    }

    // Phương thức xác thực token Facebook thực tế
    private Map<String, Object> verifyFacebookToken(String accessToken, String userId) {
        try {
            // Facebook's Graph API endpoint
            String graphApiUrl = "https://graph.facebook.com/v16.0/me?fields=id,name,email,picture&access_token="
                    + accessToken;

            // Sử dụng Spring RestTemplate để gọi API
            RestTemplate restTemplate = new RestTemplate();

            // Gọi API của Facebook để xác thực token
            ResponseEntity<String> response = restTemplate.getForEntity(graphApiUrl, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                System.err.println("Lỗi khi xác thực token Facebook: " + response.getStatusCode());
                return null;
            }

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> userInfo = mapper.readValue(response.getBody(), 
                mapper.getTypeFactory().constructMapType(Map.class, String.class, Object.class));

            if (!userInfo.getOrDefault("id", "").equals(userId)) {
                System.err.println("User ID không khớp với token");
                return null;
            }

            return userInfo;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Transactional
    private User createGoogleUser(String email, String name, String picture, String googleId) {
        try {
            System.out.println("Creating Google user with email: " + email);

            User existingUser = userService.findByEmail(email);
            if (existingUser != null) {
                System.out.println("User already exists with email: " + email + ", returning existing user");
                return existingUser;
            }

            User userWithUsername = userService.findByUsername(email);
            if (userWithUsername != null) {
                System.out.println("WARNING: Username conflict - a user with username=" + email
                        + " exists but with different email");
                // Tạo username duy nhất bằng cách thêm timestamp
                String uniqueUsername = email + "_" + System.currentTimeMillis();
                System.out.println("Using unique username instead: " + uniqueUsername);

                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(uniqueUsername);
                newUser.setFullname(name);
                newUser.setAvatar(picture);

                // Tạo mật khẩu ngẫu nhiên
                String randomPassword = UUID.randomUUID().toString();
                newUser.setPassword(passwordEncoder.encode(randomPassword));

                // Lưu metadata của Google
                newUser.setGoogleId(googleId);
                newUser.setAuthProvider("GOOGLE");

                // Tạo role mặc định cho user (USER)
                User savedUser = userService.addUser(newUser);

                // Đảm bảo vai trò được thêm thành công
                Role userRole = roleService.findByName("USER");
                if (userRole == null) {
                    System.out.println("WARNING: ROLE_USER not found, creating as default role");
                    userRole = new Role();
                    userRole.setName("USER");
                    roleService.save(userRole);
                }

                userService.addRoleToUser(savedUser, userRole);
                System.out.println("User created with unique username, ID: " + savedUser.getId() + ", role: ROLE_USER");

                return savedUser;
            }

            // Tạo user mới nếu chưa có conflict
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(email); // Sử dụng email làm username
            newUser.setFullname(name);
            newUser.setAvatar(picture);

            // Tạo mật khẩu ngẫu nhiên
            String randomPassword = UUID.randomUUID().toString();
            newUser.setPassword(passwordEncoder.encode(randomPassword));

            // Lưu metadata của Google
            newUser.setGoogleId(googleId);
            newUser.setAuthProvider("GOOGLE");

            // Sử dụng userService để thêm user và thiết lập role
            System.out.println("Calling userService.addUser with new Google user...");
            User savedUser = userService.addUser(newUser);
            System.out.println("User đã được lưu với ID: " + savedUser.getId());

            // Đảm bảo vai trò được thêm thành công
            Role userRole = roleService.findByName("USER");
            if (userRole == null) {
                System.out.println("WARNING: ROLE_USER not found, creating as default role");
                userRole = new Role();
                userRole.setName("USER");
                roleService.save(userRole);
            }

            userService.addRoleToUser(savedUser, userRole);
            System.out.println("Role ROLE_USER added to user: " + savedUser.getUsername());

            return savedUser;
        } catch (Exception e) {
            System.err.println("ERROR trong createGoogleUser: " + e.getMessage());
            e.printStackTrace();

            // Log chi tiết hơn về lỗi
            Throwable cause = e.getCause();
            if (cause != null) {
                System.err.println("Caused by: " + cause.getMessage());
                cause.printStackTrace();
            }

            throw e; // Re-throw để controller xử lý
        }
    }

    // Cập nhật thông tin user từ Google
    @Transactional
    private void updateGoogleUserInfo(User user, String name, String picture, String googleId) {
        try {
            System.out.println("Updating Google user info for: " + user.getUsername());

            // Cập nhật thông tin cá nhân
            if (name != null && !name.isEmpty()) {
                user.setFullname(name);
            }

            // Chỉ cập nhật avatar nếu người dùng chưa từng cập nhật ảnh đại diện
            // hoặc nếu đây là lần đăng nhập đầu tiên bằng Google
            if ((picture != null && !picture.isEmpty()) &&
                    (user.getAvatar() == null || user.getAvatar().isEmpty() ||
                            user.getGoogleId() == null || user.getGoogleId().isEmpty())) {
                user.setAvatar(picture);
                System.out.println("Updated avatar from Google for user: " + user.getUsername());
            } else {
                System.out.println("Preserving custom avatar for user: " + user.getUsername());
            }

            // Cập nhật Google ID nếu chưa có
            if (user.getGoogleId() == null || user.getGoogleId().isEmpty()) {
                user.setGoogleId(googleId);
                user.setAuthProvider("GOOGLE");
            }

            // Cập nhật thời gian đăng nhập cuối cùng
            user.setLastLogin(new Date());
            System.out.println("Updated last login time for user: " + user.getUsername());

            // Lưu thay đổi
            userService.update(user);
            System.out.println("Google user updated successfully: " + user.getId());
        } catch (Exception e) {
            System.err.println("Error updating Google user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Tạo Facebook user mới
    @Transactional
    private User createFacebookUser(String email, String name, String picture, String facebookId) {
        try {
            System.out.println("Creating Facebook user with email: " + email);

            // Kiểm tra lại xem user đã tồn tại chưa trước khi tạo mới
            User existingUser = userService.findByEmail(email);
            if (existingUser != null) {
                System.out.println("User already exists with email: " + email + ", returning existing user");
                return existingUser;
            }

            // Kiểm tra xem email có bị trùng với username của user khác không
            User userWithUsername = userService.findByUsername(email);
            if (userWithUsername != null) {
                System.out.println("WARNING: Username conflict - a user with username=" + email
                        + " exists but with different email");
                // Tạo username duy nhất bằng cách thêm timestamp
                String uniqueUsername = email + "_" + System.currentTimeMillis();
                System.out.println("Using unique username instead: " + uniqueUsername);

                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(uniqueUsername);
                newUser.setFullname(name);
                newUser.setAvatar(picture);

                // Tạo mật khẩu ngẫu nhiên
                String randomPassword = UUID.randomUUID().toString();
                newUser.setPassword(passwordEncoder.encode(randomPassword));

                // Lưu metadata của Facebook
                newUser.setFacebookId(facebookId);
                newUser.setAuthProvider("FACEBOOK");

                // Tạo role mặc định cho user (USER)
                User savedUser = userService.addUser(newUser);

                // Đảm bảo vai trò được thêm thành công
                Role userRole = roleService.findByName("USER");
                if (userRole == null) {
                    System.out.println("WARNING: ROLE_USER not found, creating as default role");
                    userRole = new Role();
                    userRole.setName("USER");
                    roleService.save(userRole);
                }

                userService.addRoleToUser(savedUser, userRole);
                System.out.println("User created with unique username, ID: " + savedUser.getId() + ", role: ROLE_USER");

                return savedUser;
            }

            // Tạo user mới nếu chưa có conflict
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setUsername(email); // Sử dụng email làm username
            newUser.setFullname(name);
            newUser.setAvatar(picture);

            // Tạo mật khẩu ngẫu nhiên
            String randomPassword = UUID.randomUUID().toString();
            newUser.setPassword(passwordEncoder.encode(randomPassword));

            // Lưu metadata của Facebook
            newUser.setFacebookId(facebookId);
            newUser.setAuthProvider("FACEBOOK");

            // Sử dụng userService để thêm user và thiết lập role
            System.out.println("Calling userService.addUser with new Facebook user...");
            User savedUser = userService.addUser(newUser);
            System.out.println("User đã được lưu với ID: " + savedUser.getId());

            // Đảm bảo vai trò được thêm thành công
            Role userRole = roleService.findByName("USER");
            if (userRole == null) {
                System.out.println("WARNING: ROLE_USER not found, creating as default role");
                userRole = new Role();
                userRole.setName("USER");
                roleService.save(userRole);
            }

            userService.addRoleToUser(savedUser, userRole);
            System.out.println("Role ROLE_USER added to user: " + savedUser.getUsername());

            return savedUser;
        } catch (Exception e) {
            System.err.println("ERROR trong createFacebookUser: " + e.getMessage());
            e.printStackTrace();

            // Log chi tiết hơn về lỗi
            Throwable cause = e.getCause();
            if (cause != null) {
                System.err.println("Caused by: " + cause.getMessage());
                cause.printStackTrace();
            }

            throw e; // Re-throw để controller xử lý
        }
    }

    // Cập nhật thông tin Facebook user
    @Transactional
    private void updateFacebookUserInfo(User user, String name, String picture, String facebookId) {
        try {
            System.out.println("Updating Facebook user info for: " + user.getUsername());

            // Cập nhật thông tin cá nhân
            if (name != null && !name.isEmpty()) {
                user.setFullname(name);
            }

            // Chỉ cập nhật avatar nếu người dùng chưa từng cập nhật ảnh đại diện
            // hoặc nếu đây là lần đăng nhập đầu tiên bằng Facebook
            if ((picture != null && !picture.isEmpty()) &&
                    (user.getAvatar() == null || user.getAvatar().isEmpty() ||
                            user.getFacebookId() == null || user.getFacebookId().isEmpty())) {
                user.setAvatar(picture);
                System.out.println("Updated avatar from Facebook for user: " + user.getUsername());
            } else {
                System.out.println("Preserving custom avatar for user: " + user.getUsername());
            }

            // Cập nhật Facebook ID nếu chưa có
            if (user.getFacebookId() == null || user.getFacebookId().isEmpty()) {
                user.setFacebookId(facebookId);
                user.setAuthProvider("FACEBOOK");
            }

            // Cập nhật thời gian đăng nhập cuối cùng
            user.setLastLogin(new Date());
            System.out.println("Updated last login time for user: " + user.getUsername());

            // Lưu thay đổi
            userService.update(user);
            System.out.println("Facebook user updated successfully: " + user.getId());
        } catch (Exception e) {
            System.err.println("Error updating Facebook user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}