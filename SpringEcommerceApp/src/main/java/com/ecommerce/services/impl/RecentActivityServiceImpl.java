package com.ecommerce.services.impl;

import com.ecommerce.pojo.RecentActivity;
import com.ecommerce.repositories.RecentActivityRepository;
import com.ecommerce.services.RecentActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RecentActivityServiceImpl implements RecentActivityService {

  @Autowired
  private RecentActivityRepository recentActivityRepository;

  @Override
  public RecentActivity saveActivity(RecentActivity activity) {
    return recentActivityRepository.save(activity);
  }

  @Override
  @Async
  public RecentActivity logActivity(String activityType, String description, String userEmail,
      String userName, Long entityId, String entityType, String ipAddress) {
    RecentActivity activity = new RecentActivity();
    activity.setActivityType(activityType);
    activity.setDescription(description);
    activity.setUserEmail(userEmail);
    activity.setUserName(userName);
    activity.setEntityId(entityId);
    activity.setEntityType(entityType);
    activity.setIpAddress(ipAddress);

    return saveActivity(activity);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RecentActivity> getRecentActivities(int limit) {
    return recentActivityRepository.findRecentActivities(limit);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RecentActivity> getRecentActivities(int page, int size) {
    // Tính limit dựa trên page và size
    int limit = size;
    return recentActivityRepository.findRecentActivities(limit);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RecentActivity> getActivitiesBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
    return recentActivityRepository.findActivitiesBetweenDates(startDate, endDate);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RecentActivity> getActivitiesByType(String activityType, int limit) {
    return recentActivityRepository.findByActivityType(activityType, limit);
  }

  @Override
  @Transactional(readOnly = true)
  public List<RecentActivity> getActivitiesByUser(String userEmail, int limit) {
    return recentActivityRepository.findByUserEmail(userEmail, limit);
  }

  @Override
  @Transactional(readOnly = true)
  public Long getTodayActivitiesCount() {
    return recentActivityRepository.countTodayActivities();
  }

  @Override
  @Transactional
  public void cleanupOldActivities(int daysToKeep) {
    LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
    recentActivityRepository.deleteOldActivities(cutoffDate);
  }

  // Các phương thức tiện ích để log hoạt động cụ thể

  @Override
  @Async
  public void logUserLogin(String userEmail, String userName, String ipAddress) {
    logActivity("LOGIN",
        String.format("%s đã đăng nhập vào hệ thống", userName != null ? userName : userEmail),
        userEmail, userName, null, "USER", ipAddress);
  }

  @Override
  @Async
  public void logUserLogout(String userEmail, String userName, String ipAddress) {
    logActivity("LOGOUT",
        String.format("%s đã đăng xuất khỏi hệ thống", userName != null ? userName : userEmail),
        userEmail, userName, null, "USER", ipAddress);
  }

  @Override
  @Async
  public void logUserRegistration(String userEmail, String userName, String ipAddress) {
    logActivity("USER_REGISTERED",
        String.format("Người dùng mới %s đã đăng ký tài khoản", userName != null ? userName : userEmail),
        userEmail, userName, null, "USER", ipAddress);
  }

  @Override
  @Async
  public void logOrderCreated(String userEmail, String userName, Long orderId, String ipAddress) {
    logActivity("ORDER_CREATED",
        String.format("%s đã tạo đơn hàng #%d", userName != null ? userName : userEmail, orderId),
        userEmail, userName, orderId, "ORDER", ipAddress);
  }

  @Override
  @Async
  public void logOrderStatusChanged(String userEmail, String userName, Long orderId, String newStatus,
      String ipAddress) {
    logActivity("ORDER_STATUS_CHANGED",
        String.format("Đơn hàng #%d đã được cập nhật trạng thái: %s", orderId, newStatus),
        userEmail, userName, orderId, "ORDER", ipAddress);
  }

  @Override
  @Async
  public void logProductAdded(String adminEmail, String adminName, Long productId, String productName,
      String ipAddress) {
    logActivity("PRODUCT_ADDED",
        String.format("Admin %s đã thêm sản phẩm: %s", adminName != null ? adminName : adminEmail, productName),
        adminEmail, adminName, productId, "PRODUCT", ipAddress);
  }

  @Override
  @Async
  public void logProductUpdated(String adminEmail, String adminName, Long productId, String productName,
      String ipAddress) {
    logActivity("PRODUCT_UPDATED",
        String.format("Admin %s đã cập nhật sản phẩm: %s", adminName != null ? adminName : adminEmail, productName),
        adminEmail, adminName, productId, "PRODUCT", ipAddress);
  }

  @Override
  @Async
  public void logProductDeleted(String adminEmail, String adminName, Long productId, String productName,
      String ipAddress) {
    logActivity("PRODUCT_DELETED",
        String.format("Admin %s đã xóa sản phẩm: %s", adminName != null ? adminName : adminEmail, productName),
        adminEmail, adminName, productId, "PRODUCT", ipAddress);
  }
}
