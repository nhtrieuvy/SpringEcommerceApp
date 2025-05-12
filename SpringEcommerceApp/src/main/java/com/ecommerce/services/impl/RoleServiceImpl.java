package com.ecommerce.services.impl;

import com.ecommerce.pojo.Role;
import com.ecommerce.repositories.RoleRepository;
import com.ecommerce.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void save(Role role) {
        roleRepository.save(role);
    }

    @Override
    public void update(Role role) {
        roleRepository.update(role);
    }

    @Override
    public void delete(Long id) {
        roleRepository.delete(id);
    }

    @Override
    public Role findById(Long id) {
        return roleRepository.findById(id);
    }

    @Override
    public List<Role> findAll() {
        return roleRepository.findAll();
    }    @Override
    public Role findByName(String name) {
        return roleRepository.findByName(name);
    }
      @Override
    public Role findByNameNormalized(String name) {
        if (name == null) return null;
        
        // Chuẩn hóa tên vai trò
        String normalizedName = name;
        
        System.out.println("Lookup role with original name: " + name);
        
        // Nếu tên bắt đầu bằng "ROLE_", loại bỏ tiền tố
        if (normalizedName.startsWith("ROLE_")) {
            normalizedName = normalizedName.substring(5);
            System.out.println("Stripped ROLE_ prefix, normalized name: " + normalizedName);
        }
        
        // Tìm vai trò với tên đã chuẩn hóa
        Role role = roleRepository.findByName(normalizedName);
        if (role == null) {
            System.out.println("WARNING: Role not found with name: " + normalizedName);
        } else {
            System.out.println("Found role: " + role.getName() + ", ID: " + role.getId());
        }
        
        return role;
    }
}