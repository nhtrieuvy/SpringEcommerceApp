package com.ecommerce.services.impl;

import com.ecommerce.pojo.Seller;
import com.ecommerce.repositories.SellerRepository;
import com.ecommerce.services.SellerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class SellerServiceImpl implements SellerService {
    @Autowired
    private SellerRepository sellerRepository;

    @Override
    public void save(Seller seller) {
        sellerRepository.save(seller);
    }

    @Override
    public void update(Seller seller) {
        sellerRepository.update(seller);
    }

    @Override
    public void delete(Long id) {
        sellerRepository.delete(id);
    }

    @Override
    public Seller findById(Long id) {
        return sellerRepository.findById(id);
    }

    @Override
    public List<Seller> findAll() {
        return sellerRepository.findAll();
    }

    @Override
    public Seller findByEmail(String email) {
        return sellerRepository.findByEmail(email);
    }
}