package com.ecommerce.services;

import com.ecommerce.pojo.Role;
import java.util.List;

public interface RoleService {
    void save(Role role);
    void update(Role role);
    void delete(Long id);
    Role findById(Long id);
    List<Role> findAll();
    Role findByName(String name);
}