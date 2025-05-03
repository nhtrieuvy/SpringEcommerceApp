package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Seller;
import com.ecommerce.repositories.SellerRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

@Repository
public class SellerRepositoryImpl implements SellerRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Seller seller) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(seller);
    }

    @Override
    public void update(Seller seller) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(seller);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Seller seller = session.get(Seller.class, id);
        if (seller != null) session.remove(seller);
    }

    @Override
    public Seller findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Seller.class, id);
    }

    @Override
    public List<Seller> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Seller", Seller.class).list();
    }

    @Override
    public Seller findByEmail(String email) {
        Session session = sessionFactory.getCurrentSession();
        Query<Seller> query = session.createQuery("FROM Seller WHERE email = :email", Seller.class);
        query.setParameter("email", email);
        return query.uniqueResult();
    }
}