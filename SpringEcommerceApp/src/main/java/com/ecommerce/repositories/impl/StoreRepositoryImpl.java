package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Store;
import com.ecommerce.repositories.StoreRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

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
    public List<Store> findBySellerId(Long sellerId) {
        Session session = sessionFactory.getCurrentSession();
        Query<Store> query = session.createQuery("FROM Store WHERE seller.id = :sellerId", Store.class);
        query.setParameter("sellerId", sellerId);
        return query.list();
    }
}