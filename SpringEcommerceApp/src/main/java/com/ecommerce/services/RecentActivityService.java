package com.ecommerce.services;

import com.ecommerce.pojo.RecentActivity;

import java.time.LocalDateTime;
import java.util.List;

public interface RecentActivityService {
    

  
    RecentActivity saveActivity(RecentActivity activity);
      
    RecentActivity logActivity(String activityType, String description, String userEmail, 
                              String userName, Long entityId, String entityType, String ipAddress);
    
   
    List<RecentActivity> getRecentActivities(int limit);
     
    List<RecentActivity> getRecentActivities(int page, int size);
    
   
    List<RecentActivity> getActivitiesBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    
    
    List<RecentActivity> getActivitiesByType(String activityType, int limit);
    
    
    List<RecentActivity> getActivitiesByUser(String userEmail, int limit);
    
    
    Long getTodayActivitiesCount();
    
    
    void cleanupOldActivities(int daysToKeep);
    void logUserLogin(String userEmail, String userName, String ipAddress);
    void logUserLogout(String userEmail, String userName, String ipAddress);
    void logUserRegistration(String userEmail, String userName, String ipAddress);
    void logOrderCreated(String userEmail, String userName, Long orderId, String ipAddress);
    void logOrderStatusChanged(String userEmail, String userName, Long orderId, String newStatus, String ipAddress);
    void logProductAdded(String adminEmail, String adminName, Long productId, String productName, String ipAddress);
    void logProductUpdated(String adminEmail, String adminName, Long productId, String productName, String ipAddress);
    void logProductDeleted(String adminEmail, String adminName, Long productId, String productName, String ipAddress);
}
