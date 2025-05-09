package com.ecommerce.repositories;

import com.ecommerce.pojo.User;
import java.util.List;

public interface UserRepository {

    User addUser(User user);

    void update(User user);

    void delete(Long id);

    boolean authenticate(String username, String password);

    User findById(Long id);

    List<User> findAll();

    User findByUsername(String username);

    User findByEmail(String email);
    
    List<User> findByActiveStatus(boolean isActive);
    
    List<User> findByRole(String roleName);
}
