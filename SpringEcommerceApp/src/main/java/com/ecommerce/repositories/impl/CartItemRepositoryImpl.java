package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.CartItem;
import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.CartItemRepository;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
@Transactional
public class CartItemRepositoryImpl implements CartItemRepository {

    @Autowired
    private SessionFactory sessionFactory;
    
    private Session getCurrentSession() {
        return sessionFactory.getCurrentSession();
    }

    @Override
    public List<CartItem> findByUser(User user) {
        Session session = getCurrentSession();
        Query<CartItem> q = session.createQuery("FROM CartItem WHERE user.id = :userId", CartItem.class);
        q.setParameter("userId", user.getId());
        return q.getResultList();
    }

    @Override
    public Optional<CartItem> findByUserAndProduct(User user, Product product) {
        Session session = getCurrentSession();
        Query<CartItem> q = session.createQuery(
                "FROM CartItem WHERE user.id = :userId AND product.id = :productId", 
                CartItem.class);
        q.setParameter("userId", user.getId());
        q.setParameter("productId", product.getId());
        
        return q.getResultStream().findFirst();
    }    @Override
    public void deleteByUserAndProduct(User user, Product product) {
        Session session = getCurrentSession();
        Query q = session.createQuery(
                "DELETE FROM CartItem WHERE user.id = :userId AND product.id = :productId");
        q.setParameter("userId", user.getId());
        q.setParameter("productId", product.getId());
        q.executeUpdate();
    }    @Override
    public void deleteAllByUser(User user) {
        Session session = getCurrentSession();
        Query q = session.createQuery("DELETE FROM CartItem WHERE user.id = :userId");
        q.setParameter("userId", user.getId());
        q.executeUpdate();
    }@Override
    public CartItem save(CartItem cartItem) {
        Session session = getCurrentSession();
        // Using merge instead of saveOrUpdate (which is deprecated in Hibernate 6)
        return session.merge(cartItem);
    }
}
