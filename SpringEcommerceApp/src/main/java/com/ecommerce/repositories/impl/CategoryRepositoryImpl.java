package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.Category;
import com.ecommerce.repositories.CategoryRepository;
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
public class CategoryRepositoryImpl implements CategoryRepository {
    @Autowired
    private SessionFactory sessionFactory;
    
    // Simple cache for frequently accessed categories
    private final Map<Long, Category> idCache = new ConcurrentHashMap<>();
    private final Map<String, Category> nameCache = new ConcurrentHashMap<>();

    @Override
    public void save(Category category) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(category);
        
        // Add to cache
        if (category.getId() != null) {
            idCache.put(category.getId(), category);
        }
        if (category.getName() != null) {
            nameCache.put(category.getName().toLowerCase(), category);
        }
    }

    @Override
    public void update(Category category) {
        Session session = sessionFactory.getCurrentSession();
        session.merge(category);
        
        // Update cache
        if (category.getId() != null) {
            idCache.put(category.getId(), category);
        }
        if (category.getName() != null) {
            nameCache.put(category.getName().toLowerCase(), category);
        }
    }

    @Override
    public void delete(Long id) {
        if (id == null) return;
        
        Session session = sessionFactory.getCurrentSession();
        Category category = session.get(Category.class, id);
        if (category != null) {
            // Clear cache
            idCache.remove(id);
            if (category.getName() != null) {
                nameCache.remove(category.getName().toLowerCase());
            }
            
            session.remove(category);
        }
    }

    @Override
    public Category findById(Long id) {
        if (id == null) {
            return null;
        }
        
        // Check cache first
        Category cachedCategory = idCache.get(id);
        if (cachedCategory != null) {
            return cachedCategory;
        }
        
        try {
            Session session = sessionFactory.getCurrentSession();
            Category category = session.get(Category.class, id);
            
            // Update cache if found
            if (category != null) {
                idCache.put(id, category);
                if (category.getName() != null) {
                    nameCache.put(category.getName().toLowerCase(), category);
                }
            }
            
            return category;
        } catch (Exception e) {
            System.err.println("Error finding category by id: " + e.getMessage());
            return null;
        }
    }

    @Override
    public List<Category> findAll() {
        try {
            Session session = sessionFactory.getCurrentSession();
            Query<Category> query = session.createQuery("FROM Category", Category.class);
            query.setCacheable(true); // Enable query cache
            
            List<Category> categories = query.list();
            
            // Update cache
            for (Category category : categories) {
                if (category.getId() != null) {
                    idCache.put(category.getId(), category);
                }
                if (category.getName() != null) {
                    nameCache.put(category.getName().toLowerCase(), category);
                }
            }
            
            return categories;
        } catch (Exception e) {
            System.err.println("Error getting all categories: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public Category findByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        
        String normalizedName = name.trim().toLowerCase();
        
        // Check cache first
        Category cachedCategory = nameCache.get(normalizedName);
        if (cachedCategory != null) {
            return cachedCategory;
        }
        
        try {
            Session session = sessionFactory.getCurrentSession();
            Query<Category> query = session.createQuery("FROM Category WHERE LOWER(name) = :name", Category.class);
            query.setParameter("name", normalizedName);
            query.setCacheable(true); // Enable query cache
            
            Category category = query.uniqueResult();
            
            // Update cache if found
            if (category != null) {
                nameCache.put(normalizedName, category);
                if (category.getId() != null) {
                    idCache.put(category.getId(), category);
                }
            }
            
            return category;
        } catch (Exception e) {
            System.err.println("Error finding category by name: " + e.getMessage());
            return null;
        }
    }
}