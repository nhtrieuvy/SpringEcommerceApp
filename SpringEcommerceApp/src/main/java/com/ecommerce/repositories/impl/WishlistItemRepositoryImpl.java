package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Product;
import com.ecommerce.pojo.User;
import com.ecommerce.pojo.WishlistItem;
import com.ecommerce.repositories.WishlistItemRepository;

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
public class WishlistItemRepositoryImpl implements WishlistItemRepository {

    @Autowired
    private SessionFactory sessionFactory;
    
    private Session getCurrentSession() {
        return sessionFactory.getCurrentSession();
    }

    @Override
    public List<WishlistItem> findByUser(User user) {
        Session session = getCurrentSession();
        Query<WishlistItem> q = session.createQuery("FROM WishlistItem WHERE user.id = :userId", WishlistItem.class);
        q.setParameter("userId", user.getId());
        return q.getResultList();
    }

    @Override
    public Optional<WishlistItem> findByUserAndProduct(User user, Product product) {
        Session session = getCurrentSession();
        Query<WishlistItem> q = session.createQuery(
                "FROM WishlistItem WHERE user.id = :userId AND product.id = :productId", 
                WishlistItem.class);
        q.setParameter("userId", user.getId());
        q.setParameter("productId", product.getId());
        
        return q.getResultStream().findFirst();
    }
    
    @Override
    public boolean existsByUserAndProduct(User user, Product product) {
        Session session = getCurrentSession();
        Query<Long> q = session.createQuery(
                "SELECT COUNT(*) FROM WishlistItem WHERE user.id = :userId AND product.id = :productId", 
                Long.class);
        q.setParameter("userId", user.getId());
        q.setParameter("productId", product.getId());
        
        return q.uniqueResult() > 0;
    }    @Override
    public void deleteByUserAndProduct(User user, Product product) {
        Session session = getCurrentSession();
        Query q = session.createQuery(
                "DELETE FROM WishlistItem WHERE user.id = :userId AND product.id = :productId");
        q.setParameter("userId", user.getId());
        q.setParameter("productId", product.getId());
        q.executeUpdate();
    }    @Override
    public void deleteAllByUser(User user) {
        Session session = getCurrentSession();
        Query q = session.createQuery("DELETE FROM WishlistItem WHERE user.id = :userId");
        q.setParameter("userId", user.getId());
        q.executeUpdate();
    }
      // Phương thức để lưu hoặc cập nhật một WishlistItem    @Override
    public WishlistItem save(WishlistItem wishlistItem) {
        Session session = getCurrentSession();
        // Using merge instead of saveOrUpdate (which is deprecated in Hibernate 6)
        return session.merge(wishlistItem);
    }
}
