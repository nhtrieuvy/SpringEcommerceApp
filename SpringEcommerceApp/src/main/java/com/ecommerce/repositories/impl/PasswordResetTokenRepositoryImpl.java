package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.PasswordResetToken;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.PasswordResetTokenRepository;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class PasswordResetTokenRepositoryImpl implements PasswordResetTokenRepository {

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public PasswordResetToken findByToken(String token) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            Query<PasswordResetToken> q = session.createQuery("FROM PasswordResetToken WHERE token=:token", PasswordResetToken.class);
            q.setParameter("token", token);
            return q.getSingleResult();
        } catch (Exception ex) {
            return null;
        }
    }

    @Override
    public PasswordResetToken findByUser(User user) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            Query<PasswordResetToken> q = session.createQuery("FROM PasswordResetToken WHERE user.id=:userId", PasswordResetToken.class);
            q.setParameter("userId", user.getId());
            return q.getSingleResult();
        } catch (Exception ex) {
            return null;
        }
    }

    @Override
    public void save(PasswordResetToken passwordResetToken) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            System.out.println("===== SAVING TOKEN TO DATABASE =====");
            System.out.println("Token: " + passwordResetToken.getToken());
            System.out.println("User ID: " + passwordResetToken.getUser().getId());
            System.out.println("Expiry Date: " + passwordResetToken.getExpiryDate());
            
            // Sử dụng merge thay vì saveOrUpdate để xử lý detached entities
            session.merge(passwordResetToken);
            session.flush(); // Đảm bảo lệnh SQL được thực thi ngay lập tức
            
            System.out.println("Token đã được lưu thành công vào database");
        } catch (HibernateException ex) {
            System.err.println("LỖI khi lưu token vào database: " + ex.getMessage());
            ex.printStackTrace();
            throw ex; // Ném lại exception để biết được lỗi
        } catch (Exception e) {
            System.err.println("LỖI không xác định: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public void delete(PasswordResetToken passwordResetToken) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            session.delete(passwordResetToken);
        } catch (HibernateException ex) {
            ex.printStackTrace();
        }
    }
}