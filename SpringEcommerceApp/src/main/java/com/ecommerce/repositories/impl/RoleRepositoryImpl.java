package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Role;
import com.ecommerce.repositories.RoleRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class RoleRepositoryImpl implements RoleRepository {
    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Role role) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(role);
    }

    @Override
    public void update(Role role) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(role);
    }

    @Override
    public void delete(Long id) {
        Session session = sessionFactory.getCurrentSession();
        Role role = session.get(Role.class, id);
        if (role != null) session.remove(role);
    }

    @Override
    public Role findById(Long id) {
        Session session = sessionFactory.getCurrentSession();
        return session.get(Role.class, id);
    }

    @Override
    public List<Role> findAll() {
        Session session = sessionFactory.getCurrentSession();
        return session.createQuery("FROM Role", Role.class).list();
    }

    @Override
    public Role findByName(String name) {
        Session session = sessionFactory.getCurrentSession();
        Query<Role> query = session.createQuery("FROM Role WHERE name = :name", Role.class);
        query.setParameter("name", name);
        return query.uniqueResult();
    }
}