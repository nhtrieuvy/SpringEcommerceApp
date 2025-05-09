package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.SellerRequestRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import java.util.List;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@Transactional
public class SellerRequestRepositoryImpl implements SellerRequestRepository {

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public SellerRequest save(SellerRequest sellerRequest) {
        Session session = this.sessionFactory.getCurrentSession();
        session.persist(sellerRequest);
        return sellerRequest;
    }

    @Override
    public SellerRequest update(SellerRequest sellerRequest) {
        Session session = this.sessionFactory.getCurrentSession();
        session.merge(sellerRequest);
        return sellerRequest;
    }

    @Override
    public SellerRequest findById(Long id) {
        Session session = this.sessionFactory.getCurrentSession();
        return session.get(SellerRequest.class, id);
    }

    @Override
    public List<SellerRequest> findAll() {
        Session session = this.sessionFactory.getCurrentSession();
        CriteriaBuilder builder = session.getCriteriaBuilder();
        CriteriaQuery<SellerRequest> query = builder.createQuery(SellerRequest.class);
        Root<SellerRequest> root = query.from(SellerRequest.class);
        query.select(root);
        // Sắp xếp theo ngày tạo mới nhất
        query.orderBy(builder.desc(root.get("createdDate")));
        
        return session.createQuery(query).getResultList();
    }

    @Override
    public List<SellerRequest> findByStatus(String status) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            CriteriaBuilder builder = session.getCriteriaBuilder();
            CriteriaQuery<SellerRequest> query = builder.createQuery(SellerRequest.class);
            Root<SellerRequest> root = query.from(SellerRequest.class);
            query.select(root);
            query.where(builder.equal(root.get("status"), status));
            // Sắp xếp theo ngày tạo mới nhất
            query.orderBy(builder.desc(root.get("createdDate")));
            
            return session.createQuery(query).getResultList();
        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public SellerRequest findPendingRequestByUser(User user) {
        Session session = this.sessionFactory.getCurrentSession();
        try {
            Query<SellerRequest> query = session.createQuery(
                "FROM SellerRequest sr WHERE sr.user.id = :userId AND sr.status = 'PENDING'", 
                SellerRequest.class);
            query.setParameter("userId", user.getId());
            return query.uniqueResult();
        } catch (HibernateException e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void delete(Long id) {
        Session session = this.sessionFactory.getCurrentSession();
        SellerRequest sellerRequest = session.get(SellerRequest.class, id);
        if (sellerRequest != null) {
            session.remove(sellerRequest);
        }
    }
}
