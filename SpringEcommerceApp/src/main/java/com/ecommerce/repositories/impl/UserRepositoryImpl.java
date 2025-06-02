package com.ecommerce.repositories.impl;

import com.ecommerce.pojo.User;
import com.ecommerce.repositories.UserRepository;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Collections;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Repository
public class UserRepositoryImpl implements UserRepository {

    @Autowired
    private SessionFactory sessionFactory;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final Map<String, User> usernameCache = new ConcurrentHashMap<>();
    private final Map<Long, User> idCache = new ConcurrentHashMap<>();

    @Override
    public User addUser(User user) {
        Session session = sessionFactory.getCurrentSession();
        session.persist(user);

        if (user.getUsername() != null) {
            usernameCache.put(user.getUsername(), user);
        }
        if (user.getId() != null) {
            idCache.put(user.getId(), user);
        }

        return user;
    }

    @Override
    public void update(User user) {
        Session session = sessionFactory.getCurrentSession();

        if (user.getId() != null && user.getPassword() == null) {
            User existingUser = this.findById(user.getId());
            if (existingUser != null && existingUser.getPassword() != null) {
                user.setPassword(existingUser.getPassword());
                System.out.println("Password preserved for user: " + user.getUsername());
            }
        }

        session.merge(user);

        if (user.getUsername() != null) {
            usernameCache.put(user.getUsername(), user);
        }
        if (user.getId() != null) {
            idCache.put(user.getId(), user);
        }
    }

    @Override
    public void delete(Long id) {
        if (id == null)
            return;

        Session session = sessionFactory.getCurrentSession();
        User user = session.get(User.class, id);
        if (user != null) {
            usernameCache.remove(user.getUsername());
            idCache.remove(id);

            session.remove(user);
        }
    }

    @Override
    public User findById(Long id) {
        if (id == null) {
            return null;
        }

        User cachedUser = idCache.get(id);
        if (cachedUser != null) {
            return cachedUser;
        }

        Session session = sessionFactory.getCurrentSession();
        User user = session.get(User.class, id);

        if (user != null) {
            idCache.put(id, user);
            if (user.getUsername() != null) {
                usernameCache.put(user.getUsername(), user);
            }
        }

        return user;
    }

    @Override
    public List<User> findAll() {
        try {
            Session session = sessionFactory.getCurrentSession();
            Query<User> query = session.createQuery("FROM User", User.class);
            query.setCacheable(true);
            return query.list();
        } catch (Exception e) {
            System.err.println("Error getting all users: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public User findByUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            return null;
        }

        String normalizedUsername = username.trim();

        User cachedUser = usernameCache.get(normalizedUsername);
        if (cachedUser != null) {
            return cachedUser;
        }

        try {
            Session session = sessionFactory.getCurrentSession();
            Query<User> query = session.createQuery("FROM User WHERE username = :username", User.class);
            query.setParameter("username", normalizedUsername);
            query.setCacheable(true);

            User user = query.uniqueResult();

            if (user != null) {
                usernameCache.put(normalizedUsername, user);
                if (user.getId() != null) {
                    idCache.put(user.getId(), user);
                }
            }

            return user;
        } catch (Exception e) {
            System.err.println("Error finding user by username: " + e.getMessage());
            return null;
        }
    }

    @Override
    public User findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }

        String normalizedEmail = email.trim().toLowerCase();

        try {
            Session session = sessionFactory.getCurrentSession();
            Query<User> query = session.createQuery("FROM User WHERE email = :email", User.class);
            query.setParameter("email", normalizedEmail);
            query.setCacheable(true);

            User user = query.uniqueResult();

            if (user != null) {
                if (user.getUsername() != null) {
                    usernameCache.put(user.getUsername(), user);
                }
                if (user.getId() != null) {
                    idCache.put(user.getId(), user);
                }
            }

            return user;
        } catch (Exception e) {
            System.err.println("Error finding user by email: " + e.getMessage());
            return null;
        }
    }

    @Override
    public boolean authenticate(String username, String password) {
        if (username == null || password == null) {
            return false;
        }

        User user = this.findByUsername(username);
        if (user == null) {
            return false;
        }

        return passwordEncoder.matches(password, user.getPassword());
    }

    @Override
    public List<User> findByActiveStatus(boolean isActive) {
        Session session = sessionFactory.getCurrentSession();

        try {
            Query<User> query = session.createQuery("FROM User u WHERE u.isActive = :active", User.class);
            query.setParameter("active", isActive);
            return query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @Override
    public List<User> findByRole(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            Session session = sessionFactory.getCurrentSession();

            Query<User> query = session.createQuery(
                    "SELECT DISTINCT u FROM User u " +
                            "JOIN u.roles r " +
                            "WHERE r.name = :roleName",
                    User.class);
            query.setParameter("roleName", roleName);

            return query.getResultList();
        } catch (Exception e) {
            System.err.println("Error finding users by role: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @Override
    public List<User> searchUsers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedKeyword = keyword.trim().toLowerCase();

        try {
            Session session = sessionFactory.getCurrentSession();
            Query<User> query = session.createQuery(
                    "FROM User WHERE (LOWER(username) LIKE :keyword OR LOWER(email) LIKE :keyword OR LOWER(fullname) LIKE :keyword) AND isActive = true",
                    User.class);
            query.setParameter("keyword", "%" + normalizedKeyword + "%");
            query.setCacheable(true);

            return query.getResultList();
        } catch (Exception e) {
            System.err.println("Error searching users: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
