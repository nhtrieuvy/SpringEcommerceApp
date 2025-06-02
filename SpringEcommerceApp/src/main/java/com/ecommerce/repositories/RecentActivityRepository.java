package com.ecommerce.repositories;

import com.ecommerce.pojo.RecentActivity;
import java.time.LocalDateTime;
import java.util.List;

public interface RecentActivityRepository {
    
   
    RecentActivity save(RecentActivity activity);
    
    
    List<RecentActivity> findAll();
    
    
    List<RecentActivity> findRecentActivities(int limit);    
    
    List<RecentActivity> findActivitiesBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    
   
    List<RecentActivity> findByActivityType(String activityType, int limit);
    
    
    List<RecentActivity> findByUserEmail(String userEmail, int limit);
    
    
    Long countTodayActivities();
     
    void deleteOldActivities(LocalDateTime cutoffDate);
}
