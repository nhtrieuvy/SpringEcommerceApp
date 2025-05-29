package com.ecommerce.repositories;

import com.ecommerce.pojo.RecentActivity;
import java.time.LocalDateTime;
import java.util.List;

public interface RecentActivityRepository {
    
    /**
     * Lưu hoạt động mới
     */
    RecentActivity save(RecentActivity activity);
    
    /**
     * Tìm tất cả hoạt động
     */
    List<RecentActivity> findAll();
    
    /**
     * Lấy danh sách hoạt động gần đây với limit
     */
    List<RecentActivity> findRecentActivities(int limit);    /**
     * Lấy hoạt động gần đây trong khoảng thời gian
     */
    List<RecentActivity> findActivitiesBetweenDates(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Lấy hoạt động theo loại
     */
    List<RecentActivity> findByActivityType(String activityType, int limit);
    
    /**
     * Lấy hoạt động của một người dùng cụ thể
     */
    List<RecentActivity> findByUserEmail(String userEmail, int limit);
    
    /**
     * Đếm số hoạt động trong ngày hôm nay
     */
    Long countTodayActivities();    /**
     * Xóa các hoạt động cũ hơn số ngày chỉ định
     */
    void deleteOldActivities(LocalDateTime cutoffDate);
}
