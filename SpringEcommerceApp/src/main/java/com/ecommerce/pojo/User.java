package com.ecommerce.pojo;

import jakarta.persistence.*;
import java.util.Date;
import java.util.Set;
import lombok.AllArgsConstructor;

import lombok.NoArgsConstructor;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(name = "fullname")
    private String fullname;
    
    @Column(name = "phone")
    private String phone;
    
    @Column(length = 1024)
    private String avatar;

    // Trường mới cho đăng nhập Google
    @Column(name = "google_id")
    private String googleId;
    
    // Trường mới cho đăng nhập Facebook
    @Column(name = "facebook_id")
    private String facebookId;
    
    // Trường để xác định đăng nhập từ đâu
    @Column(name = "auth_provider")
    private String authProvider;
      // Trường lưu thời gian tạo tài khoản
    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;
    
    // Trường lưu thời gian đăng nhập cuối cùng
    @Column(name = "last_login")
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastLogin;
      // Trường xác định trạng thái hoạt động của tài khoản
    @Column(name = "is_active")
    @JsonProperty("active")
    private boolean isActive = true;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonManagedReference
    private Set<Role> roles;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public String getFacebookId() {
        return facebookId;
    }

    public void setFacebookId(String facebookId) {
        this.facebookId = facebookId;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }
    
    public Date getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }    // Sử dụng get/set prefix để đảm bảo Jackson đọc đúng thuộc tính
    // @JsonProperty("isActive")
    // public boolean getIsActive() {
    //     return isActive;
    // }

    // @JsonProperty("isActive")
    // public void setIsActive(boolean active) {
    //     isActive = active;
    // }
      // Giữ phương thức isActive để tương thích với các phần khác của code
    @JsonProperty("isActive")
    public boolean isActive() {
        return isActive;
    }
    
    @JsonProperty("isActive")
    public void setActive(boolean active) {
        isActive = active;
    }

    // Add standard getter/setter with different names to ensure proper JSON serialization
    @JsonProperty("active")
    public boolean getActive() {
        return isActive;
    }
    
    @JsonProperty("active")
    public void setIsActive(boolean active) {
        isActive = active;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    // PrePersist để tự động thiết lập thời gian tạo khi lưu đối tượng mới
    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = new Date();
        }
    }

    // Kiểm tra xem người dùng có vai trò Admin hay không
    public boolean isAdmin() {
        if (this.roles != null) {
            return this.roles.stream()
                    .anyMatch(role -> "ADMIN".equals(role.getName()));
        }
        return false;
    }
    
    // Kiểm tra xem người dùng có vai trò cụ thể hay không
    public boolean hasRole(String roleName) {
        if (this.roles != null) {
            return this.roles.stream()
                    .anyMatch(role -> roleName.equals(role.getName()));
        }
        return false;
    }
}