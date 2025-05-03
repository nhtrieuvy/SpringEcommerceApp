package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Category;
import com.ecommerce.repositories.CategoryRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;

@Repository
public class CategoryRepositoryImpl implements CategoryRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Category category) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(category);
    }

    @Override
    public void update(Category category) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(category);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Category category = session.get(Category.class, id);
        if (category != null) session.remove(category);
    }

    @Override
    public Category findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Category.class, id);
    }

    @Override
    public List<Category> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Category", Category.class).list();
    }

    @Override
    public Category findByName(String name) {
        Session session = sessionFactory.getCurrentSession();
        Query<Category> query = session.createQuery("FROM Category WHERE name = :name", Category.class);
        query.setParameter("name", name);
        return query.uniqueResult();
    }
}