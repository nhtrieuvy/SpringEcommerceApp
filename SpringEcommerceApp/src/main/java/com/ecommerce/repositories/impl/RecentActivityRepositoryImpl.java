package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.RecentActivity;
import com.ecommerce.repositories.RecentActivityRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
@Transactional
public class RecentActivityRepositoryImpl implements RecentActivityRepository {

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public RecentActivity save(RecentActivity activity) {
        Session session = sessionFactory.getCurrentSession();
        if (activity.getId() == null) {
            session.persist(activity);
        } else {
            session.merge(activity);
        }
        return activity;
    }

    @Override
    public List<RecentActivity> findAll() {
        Session session = sessionFactory.getCurrentSession();
        Query<RecentActivity> query = session.createQuery(
                "FROM RecentActivity ORDER BY createdAt DESC", RecentActivity.class);
        return query.getResultList();
    }

    @Override
    public List<RecentActivity> findRecentActivities(int limit) {
        Session session = sessionFactory.getCurrentSession();
        Query<RecentActivity> query = session.createQuery(
                "FROM RecentActivity ORDER BY createdAt DESC", RecentActivity.class);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<RecentActivity> findActivitiesBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        Session session = sessionFactory.getCurrentSession();
        Query<RecentActivity> query = session.createQuery(
                "FROM RecentActivity WHERE createdAt BETWEEN :startDate AND :endDate ORDER BY createdAt DESC",
                RecentActivity.class);
        query.setParameter("startDate", startDate);
        query.setParameter("endDate", endDate);
        return query.getResultList();
    }

    @Override
    public List<RecentActivity> findByActivityType(String activityType, int limit) {
        Session session = sessionFactory.getCurrentSession();
        Query<RecentActivity> query = session.createQuery(
                "FROM RecentActivity WHERE activityType = :activityType ORDER BY createdAt DESC",
                RecentActivity.class);
        query.setParameter("activityType", activityType);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<RecentActivity> findByUserEmail(String userEmail, int limit) {
        Session session = sessionFactory.getCurrentSession();
        Query<RecentActivity> query = session.createQuery(
                "FROM RecentActivity WHERE userEmail = :userEmail ORDER BY createdAt DESC",
                RecentActivity.class);
        query.setParameter("userEmail", userEmail);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public Long countTodayActivities() {
        Session session = sessionFactory.getCurrentSession();
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        Query<Long> query = session.createQuery(
                "SELECT COUNT(r) FROM RecentActivity r WHERE r.createdAt >= :startOfDay AND r.createdAt < :endOfDay",
                Long.class);
        query.setParameter("startOfDay", startOfDay);
        query.setParameter("endOfDay", endOfDay);
        return query.uniqueResult();
    }

    @Override
    public void deleteOldActivities(LocalDateTime cutoffDate) {
        Session session = sessionFactory.getCurrentSession();
        Query<Integer> query = session.createQuery(
                "DELETE FROM RecentActivity WHERE createdAt < :cutoffDate", Integer.class);
        query.setParameter("cutoffDate", cutoffDate);
        query.executeUpdate();
    }
}
