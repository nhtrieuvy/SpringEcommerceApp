package com.ecommerce.repositories;

import com.ecommerce.pojo.Category;
import java.util.List;

public interface CategoryRepository {
    Category save(Category category);
    Category update(Category category);
    void delete(Long id);
    Category findById(Long id);
    List<Category> findAll();
    Category findByName(String name);
}