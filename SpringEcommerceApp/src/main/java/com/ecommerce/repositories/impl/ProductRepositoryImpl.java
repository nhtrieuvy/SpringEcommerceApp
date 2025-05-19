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
<<<<<<< Updated upstream
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
=======
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
        if (minPrice != null) {
            hql.append(" AND p.price >= :minPrice");
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
>>>>>>> Stashed changes
