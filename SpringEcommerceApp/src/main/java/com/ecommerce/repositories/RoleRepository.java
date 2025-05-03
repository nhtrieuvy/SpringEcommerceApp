package com.ecommerce.repositories;

import com.ecommerce.pojo.Role;
import java.util.List;

public interface RoleRepository {
    void save(Role role);
    void update(Role role);
    void delete(Long id);
    Role findById(Long id);
    List<Role> findAll();
    Role findByName(String name);
}
