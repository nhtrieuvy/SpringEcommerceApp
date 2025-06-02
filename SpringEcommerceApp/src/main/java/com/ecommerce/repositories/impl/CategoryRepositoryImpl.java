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

    private final Map<Long, Category> idCache = new ConcurrentHashMap<>();
    private final Map<String, Category> nameCache = new ConcurrentHashMap<>();

    @Override
    public Category save(Category category) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(category);

        if (category.getId() != null) {
            idCache.put(category.getId(), category);
        }
        if (category.getName() != null) {
            nameCache.put(category.getName().toLowerCase(), category);
        }

        return category;
    }

    @Override
    public Category update(Category category) {
        Session session = sessionFactory.getCurrentSession();
        category = (Category) session.merge(category);

        if (category.getId() != null) {
            idCache.put(category.getId(), category);
        }
        if (category.getName() != null) {
            nameCache.put(category.getName().toLowerCase(), category);
        }

        return category;
    }

    @Override
    public void delete(Long id) {
        if (id == null)
            return;

        Session session = sessionFactory.getCurrentSession();
        Category category = session.get(Category.class, id);
        if (category != null) {
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

        Category cachedCategory = idCache.get(id);
        if (cachedCategory != null) {
            return cachedCategory;
        }

        try {
            Session session = sessionFactory.getCurrentSession();

            Query<Category> query = session.createQuery(
                    "SELECT c FROM Category c LEFT JOIN FETCH c.products WHERE c.id = :id",
                    Category.class);
            query.setParameter("id", id);
            Category category = query.uniqueResult();

            if (category != null) {
                if (category.getProducts() != null) {
                    category.getProducts().size();
                }

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

            Query<Category> query = session.createQuery(
                    "SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.products", Category.class);
            query.setCacheable(true); // Enable query cache

            List<Category> categories = query.list();

            for (Category category : categories) {
                if (category.getProducts() != null) {
                    category.getProducts().size();
                }

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

        Category cachedCategory = nameCache.get(normalizedName);
        if (cachedCategory != null) {
            return cachedCategory;
        }

        try {
            Session session = sessionFactory.getCurrentSession();
            Query<Category> query = session.createQuery(
                    "SELECT c FROM Category c LEFT JOIN FETCH c.products WHERE LOWER(c.name) = :name",
                    Category.class);
            query.setParameter("name", normalizedName);
            query.setCacheable(true);

            Category category = query.uniqueResult();

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