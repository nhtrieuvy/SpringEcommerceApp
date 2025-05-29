package com.ecommerce.services;

import com.ecommerce.pojo.RecentActivity;

import java.time.LocalDateTime;
import java.util.List;

public interface RecentActivityService {
    
    /**
     * Lưu một hoạt động mới
     */
    RecentActivity saveActivity(RecentActivity activity);
      /**
     * Tạo và lưu hoạt động mới
     */
    RecentActivity logActivity(String activityType, String description, String userEmail, 
                              String userName, Long entityId, String entityType, String ipAddress);
    
    /**
     * Lấy danh sách hoạt động gần đây
     */
    List<RecentActivity> getRecentActivities(int limit);
      /**
     * Lấy hoạt động gần đây với phân trang
     */
    List<RecentActivity> getRecentActivities(int page, int size);
    
    /**
     * Lấy hoạt động trong khoảng thời gian
     */
    List<RecentActivity> getActivitiesBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Lấy hoạt động theo loại
     */
    List<RecentActivity> getActivitiesByType(String activityType, int limit);
    
    /**
     * Lấy hoạt động của người dùng
     */
    List<RecentActivity> getActivitiesByUser(String userEmail, int limit);
    
    /**
     * Đếm số hoạt động hôm nay
     */
    Long getTodayActivitiesCount();
    
    /**
     * Dọn dẹp các hoạt động cũ
     */
    void cleanupOldActivities(int daysToKeep);
      // Các phương thức tiện ích để log các loại hoạt động cụ thể
    void logUserLogin(String userEmail, String userName, String ipAddress);
    void logUserLogout(String userEmail, String userName, String ipAddress);
    void logUserRegistration(String userEmail, String userName, String ipAddress);
    void logOrderCreated(String userEmail, String userName, Long orderId, String ipAddress);
    void logOrderStatusChanged(String userEmail, String userName, Long orderId, String newStatus, String ipAddress);
    void logProductAdded(String adminEmail, String adminName, Long productId, String productName, String ipAddress);
    void logProductUpdated(String adminEmail, String adminName, Long productId, String productName, String ipAddress);
    void logProductDeleted(String adminEmail, String adminName, Long productId, String productName, String ipAddress);
}
