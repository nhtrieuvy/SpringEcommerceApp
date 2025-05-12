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
    
    /**
     * Tìm vai trò bằng tên, tự động xử lý tiền tố "ROLE_"
     * @param name Tên vai trò (có hoặc không có tiền tố "ROLE_")
     * @return Role nếu tìm thấy, null nếu không tìm thấy
     */
    Role findByNameNormalized(String name);
}