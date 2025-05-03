package com.ecommerce.services;

import com.ecommerce.pojo.Category;
import java.util.List;

public interface CategoryService {
    void save(Category category);
    void update(Category category);
    void delete(Long id);
    Category findById(Long id);
    List<Category> findAll();
    Category findByName(String name);
}