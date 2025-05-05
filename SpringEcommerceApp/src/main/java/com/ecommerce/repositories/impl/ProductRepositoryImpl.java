package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Product;
import com.ecommerce.repositories.ProductRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.hibernate.query.Query;
import java.util.List;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class ProductRepositoryImpl implements ProductRepository {
    @Autowired
    private SessionFactory sessionFactory;
    
    // Simple cache for frequently accessed products
    private final Map<Long, Product> idCache = new ConcurrentHashMap<>();

    @Override
    public void save(Product product) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(product);
        
        // Add to cache if it has an ID
        if (product.getId() != null) {
            idCache.put(product.getId(), product);
        }
    }

    @Override
    public void update(Product product) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(product);
        
        // Update cache
        if (product.getId() != null) {
            idCache.put(product.getId(), product);
        }
    }

    @Override
    public void delete(Long id) {
        if (id == null) return;
        
        Session session = sessionFactory.getCurrentSession();
        Product product = session.get(Product.class, id);
        if (product != null) {
            // Clear cache
            idCache.remove(id);
            session.remove(product);
        }
    }

    @Override
    public Product findById(Long id) {
        if (id == null) {
            return null;
        }
        
        // Check cache first
        Product cachedProduct = idCache.get(id);
        if (cachedProduct != null) {
            return cachedProduct;
        }
        
        try {
            Session session = sessionFactory.getCurrentSession();
            Product product = session.get(Product.class, id);
            
            // Update cache if found
            if (product != null) {
                idCache.put(id, product);
            }
            
            return product;
        } catch (Exception e) {
            System.err.println("Error finding product by id: " + e.getMessage());
            return null;
        }
    }

    @Override
    public List<Product> findAll() {
        try {
            Session session = sessionFactory.getCurrentSession();
            Query<Product> query = session.createQuery("FROM Product", Product.class);
            query.setCacheable(true); // Enable query cache
            return query.list();
        } catch (Exception e) {
            System.err.println("Error getting all products: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public List<Product> findByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return findAll();
        }
        
        try {
            Session session = sessionFactory.getCurrentSession();
            // Tìm kiếm tương đối với LIKE để tìm kiếm tên sản phẩm không chính xác
            String nameLike = "%" + name.trim() + "%";
            Query<Product> query = session.createQuery(
                    "FROM Product WHERE LOWER(name) LIKE LOWER(:name)", 
                    Product.class);
            query.setParameter("name", nameLike);
            query.setCacheable(true); // Enable query cache
            return query.list();
        } catch (Exception e) {
            System.err.println("Error finding products by name: " + e.getMessage());
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<Product> findByCategoryId(Long categoryId) {
        if (categoryId == null) {
            return findAll();
        }
        
        try {
            Session session = sessionFactory.getCurrentSession();
            Query<Product> query = session.createQuery(
                    "FROM Product p WHERE p.category.id = :categoryId", 
                    Product.class);
            query.setParameter("categoryId", categoryId);
            query.setCacheable(true); // Enable query cache
            return query.list();
        } catch (Exception e) {
            System.err.println("Error finding products by category id: " + e.getMessage());
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<Product> findByPriceRange(Double minPrice, Double maxPrice) {
        try {
            Session session = sessionFactory.getCurrentSession();
            StringBuilder queryBuilder = new StringBuilder("FROM Product p WHERE 1=1");
            
            if (minPrice != null) {
                queryBuilder.append(" AND p.price >= :minPrice");
            }
            
            if (maxPrice != null) {
                queryBuilder.append(" AND p.price <= :maxPrice");
            }
            
            Query<Product> query = session.createQuery(queryBuilder.toString(), Product.class);
            
            if (minPrice != null) {
                query.setParameter("minPrice", minPrice);
            }
            
            if (maxPrice != null) {
                query.setParameter("maxPrice", maxPrice);
            }
            
            query.setCacheable(true); // Enable query cache
            return query.list();
        } catch (Exception e) {
            System.err.println("Error finding products by price range: " + e.getMessage());
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<Product> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return findAll();
        }
        
        try {
            String cleanKeyword = keyword.trim().toLowerCase();
            
            // Tìm kiếm cơ bản dùng LIKE 
            Session session = sessionFactory.getCurrentSession();
            String queryStr = "FROM Product p WHERE " +
                    "LOWER(p.name) LIKE :keyword OR " +
                    "LOWER(p.description) LIKE :keyword OR " +
                    "LOWER(p.category.name) LIKE :keyword";
            
            Query<Product> query = session.createQuery(queryStr, Product.class);
            query.setParameter("keyword", "%" + cleanKeyword + "%");
            
            // Không cache query tìm kiếm vì keyword có thể thay đổi rất nhiều
            return query.list();
        } catch (Exception e) {
            System.err.println("Error searching products: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}