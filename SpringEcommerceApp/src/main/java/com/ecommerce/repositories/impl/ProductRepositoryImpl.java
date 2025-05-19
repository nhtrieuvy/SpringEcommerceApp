package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Product;
import com.ecommerce.repositories.ProductRepository;
import jakarta.transaction.Transactional;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Transactional
public class ProductRepositoryImpl implements ProductRepository {

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public void save(Product product) {
        getCurrentSession().persist(product);
    }

    @Override
    public void update(Product product) {
        getCurrentSession().merge(product);
    }

    @Override
    public void delete(Long id) {
        Product product = findById(id);
        if (product != null) getCurrentSession().remove(product);
    }    @Override
    public Product findById(Long id) {
        String hql = "SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.store WHERE p.id = :id";
        return getCurrentSession()
                .createQuery(hql, Product.class)
                .setParameter("id", id)
                .uniqueResult();
    }@Override
    public List<Product> findAll() {
        // First fetch with category
        Query<Product> query = getCurrentSession().createQuery(
                "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category", 
                Product.class);
        List<Product> products = query.getResultList();
        
        // Then initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }    @Override
    public List<Product> findByName(String name) {
        String hql = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE LOWER(p.name) LIKE :kw";
        List<Product> products = getCurrentSession()
                .createQuery(hql, Product.class)
                .setParameter("kw", "%" + name.toLowerCase() + "%")
                .getResultList();
                
        // Then initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }    @Override
    public List<Product> findByCategoryId(Long categoryId) {
        String hql = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE p.category.id = :catId";
        List<Product> products = getCurrentSession()
                .createQuery(hql, Product.class)
                .setParameter("catId", categoryId)
                .getResultList();
// Initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }    @Override
    public List<Product> findByPriceRange(Double min, Double max) {
        String hql = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE p.price >= :min AND p.price <= :max";
        List<Product> products = getCurrentSession()
                .createQuery(hql, Product.class)
                .setParameter("min", min)
                .setParameter("max", max)
                .getResultList();
        
        // Initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }    @Override
    public List<Product> search(String keyword) {
        String hql = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE LOWER(p.name) LIKE :kw";
        List<Product> products = getCurrentSession()
                .createQuery(hql, Product.class)
                .setParameter("kw", "%" + keyword.toLowerCase() + "%")
                .getResultList();
        
        // Initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }@Override
    public List<Product> findByStoreId(Long storeId) {
        String hql = "SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE p.store.id = :storeId";
        List<Product> products = getCurrentSession()
                .createQuery(hql, Product.class)
                .setParameter("storeId", storeId)
                .getResultList();
        
        // Initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }    @Override
    public List<Product> searchAdvanced(String name, Long storeId, Double minPrice, Double maxPrice,
                                        String sortBy, String sortDir, int page, int size) {
        StringBuilder hql = new StringBuilder("SELECT DISTINCT p FROM Product p LEFT JOIN FETCH p.category WHERE 1=1");

        if (name != null && !name.isEmpty()) {
            hql.append(" AND LOWER(p.name) LIKE :name");
        }
        if (storeId != null) {
            hql.append(" AND p.store.id = :storeId");
        }
        if (minPrice != null) {hql.append(" AND p.price >= :minPrice");
        }
        if (maxPrice != null) {
            hql.append(" AND p.price <= :maxPrice");
        }

        // Sorting
        if (sortBy != null && !sortBy.isEmpty()) {
            hql.append(" ORDER BY p.").append(sortBy);
            if ("desc".equalsIgnoreCase(sortDir)) {
                hql.append(" DESC");
            } else {
                hql.append(" ASC");
            }
        }

        Session session = getCurrentSession();
        Query<Product> query = session.createQuery(hql.toString(), Product.class);

        if (name != null && !name.isEmpty()) {
            query.setParameter("name", "%" + name.toLowerCase() + "%");
        }
        if (storeId != null) query.setParameter("storeId", storeId);
        if (minPrice != null) query.setParameter("minPrice", minPrice);
        if (maxPrice != null) query.setParameter("maxPrice", maxPrice);

        // Pagination
        query.setFirstResult(page * size);
        query.setMaxResults(size);

        List<Product> products = query.getResultList();
        
        // Initialize the store for each product to avoid LazyInitializationException
        for (Product product : products) {
            if (product.getStore() != null) {
                product.getStore().getName(); // Force initialization
            }
        }
        
        return products;
    }

    private Session getCurrentSession() {
        return sessionFactory.getCurrentSession();
    }
}