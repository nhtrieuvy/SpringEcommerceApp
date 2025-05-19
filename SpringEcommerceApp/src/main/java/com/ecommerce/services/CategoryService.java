package com.ecommerce.services;

import com.ecommerce.pojo.Category;
import java.util.List;

public interface CategoryService {
    Category save(Category category);
    Category update(Category category);
    boolean delete(Long id);
    Category findById(Long id);
    List<Category> findAll();
    Category findByName(String name);
}