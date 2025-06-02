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
import java.util.ArrayList;
import java.util.HashMap;

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
        try {
            System.out.println("Updating store in repository layer: " + store.getId());
            System.out.println("Store name: " + store.getName());
            System.out.println("Store logo: " + store.getLogo());
            Session session = sessionFactory.getCurrentSession();

            session.merge(store);
            session.flush();

            System.out.println("Store updated successfully in database");
        } catch (Exception e) {
            System.err.println("Error updating store in repository layer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void delete(Long id) {
        try {
            System.out.println("Attempting to delete store with ID: " + id);
            Session session = sessionFactory.getCurrentSession();

            Store store = session.get(Store.class, id);

            if (store != null) {
                System.out.println("Store found, attempting to delete: " + store.getName());

                session.remove(store);
                session.flush();
                System.out.println("Store deleted successfully with its products");
            } else {
                System.out.println("Store with ID " + id + " not found");
            }
        } catch (Exception e) {
            System.err.println("Error deleting store: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Store findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT s FROM Store s LEFT JOIN FETCH s.products WHERE s.id = :id";
        Query<Store> query = session.createQuery(hql, Store.class);
        query.setParameter("id", id);
        return query.uniqueResult();
    }

    @Override
    public List<Store> findAll() {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT s FROM Store s LEFT JOIN FETCH s.products";
        return session.createQuery(hql, Store.class).list();
    }

    @Override
    public List<Store> findByUserId(Long userId) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT DISTINCT s FROM Store s LEFT JOIN FETCH s.products WHERE s.seller.id = :userId";
        Query<Store> query = session.createQuery(hql, Store.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }

    @Override
    public List<Map<String, Object>> findAllWithUserInfo() {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT s.id, s.name, s.description, s.address, s.logo, s.active, " +
                "u.id, u.username, u.fullname " +
                "FROM Store s JOIN s.seller u";
        Query<Object[]> query = session.createQuery(hql, Object[].class);
        List<Object[]> results = query.getResultList();

        List<Map<String, Object>> mappedResults = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("name", row[1]);
            map.put("description", row[2]);
            map.put("address", row[3]);
            map.put("logo", row[4]);
            map.put("active", row[5]);
            map.put("userId", row[6]);
            map.put("username", row[7]);
            map.put("fullname", row[8]);
            mappedResults.add(map);
        }
        return mappedResults;
    }

    @Override
    public Map<String, Object> findByIdWithUserInfo(Long id) {
        Session session = sessionFactory.getCurrentSession();
        String hql = "SELECT s.id, s.name, s.description, s.address, s.logo, s.active, " +
                "u.id, u.username, u.fullname " +
                "FROM Store s JOIN s.seller u WHERE s.id = :id";
        Query<Object[]> query = session.createQuery(hql, Object[].class);
        query.setParameter("id", id);
        Object[] result = query.uniqueResultOptional().orElse(null);

        if (result == null) {
            return null;
        }

        Map<String, Object> map = new HashMap<>();
        map.put("id", result[0]);
        map.put("name", result[1]);
        map.put("description", result[2]);
        map.put("address", result[3]);
        map.put("logo", result[4]);
        map.put("active", result[5]);
        map.put("userId", result[6]);
        map.put("username", result[7]);
        map.put("fullname", result[8]);
        return map;
    }
}