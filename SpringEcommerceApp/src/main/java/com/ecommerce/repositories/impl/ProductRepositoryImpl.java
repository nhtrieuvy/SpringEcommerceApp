package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Product;
import com.ecommerce.repositories.ProductRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class ProductRepositoryImpl implements ProductRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Product product) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(product);
    }

    @Override
    public void update(Product product) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(product);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Product product = session.get(Product.class, id);
        if (product != null) session.remove(product);
    }

    @Override
    public Product findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Product.class, id);
    }

    @Override
    public List<Product> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Product", Product.class).list();
    }

    @Override
    public List<Product> findByName(String name) {
        Session session = sessionFactory.getCurrentSession();
        Query<Product> query = session.createQuery("FROM Product WHERE name LIKE :name", Product.class);
        query.setParameter("name", "%" + name + "%");
        return query.list();
    }
}