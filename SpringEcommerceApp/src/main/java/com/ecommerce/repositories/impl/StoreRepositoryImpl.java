package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Store;
import com.ecommerce.repositories.StoreRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;
import java.util.Map;

@Repository
public class StoreRepositoryImpl implements StoreRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Store store) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(store);
    }

    @Override
    public void update(Store store) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(store);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Store store = session.get(Store.class, id);
        if (store != null) session.remove(store);
    }

    @Override
    public Store findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Store.class, id);
    }

    @Override
    public List<Store> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Store", Store.class).list();
    }

    @Override
    public List<Store> findByUserId(Long userId) {
        Session session = sessionFactory.getCurrentSession();
        Query<Store> query = session.createQuery("FROM Store WHERE seller.id = :userId", Store.class);
        query.setParameter("userId", userId);
        return query.list();
    }    @Override
    public List<Map<String, Object>> findAllWithUserInfo() {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT new map(s.id as id, s.name as name, s.description as description, " +
                "s.address as address, s.logo as logo, s.active as active, " +
                "u.id as userId, u.username as username, u.fullname as fullname) " +
                "FROM Store s JOIN s.seller u";
        
        @SuppressWarnings("unchecked")
        Query<Map<String, Object>> query = session.createQuery(hql);
        return query.list();
    }

    @Override
    public Map<String, Object> findByIdWithUserInfo(Long id) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT new map(s.id as id, s.name as name, s.description as description, " +
                "s.address as address, s.logo as logo, s.active as active, " +
                "u.id as userId, u.username as username, u.fullname as fullname) " +
                "FROM Store s JOIN s.seller u WHERE s.id = :id";
        
        @SuppressWarnings("unchecked")
        Query<Map<String, Object>> query = session.createQuery(hql);
        query.setParameter("id", id);
        return query.uniqueResult();
    }
}