package com.ecommerce.repositories;

import com.ecommerce.pojo.Seller;
import java.util.List;

public interface SellerRepository {
    void save(Seller seller);
    void update(Seller seller);
    void delete(Long id);
    Seller findById(Long id);
    List<Seller> findAll();
    Seller findByEmail(String email);
}