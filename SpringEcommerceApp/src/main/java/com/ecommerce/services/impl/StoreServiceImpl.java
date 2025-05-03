package com.ecommerce.services.impl;

import com.ecommerce.pojo.Store;
import com.ecommerce.repositories.StoreRepository;
import com.ecommerce.services.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class StoreServiceImpl implements StoreService {
    @Autowired
    private StoreRepository storeRepository;

    @Override
    public void save(Store store) {
        storeRepository.save(store);
    }

    @Override
    public void update(Store store) {
        storeRepository.update(store);
    }

    @Override
    public void delete(Long id) {
        // Implement delete logic if needed
    }

    @Override
    public Store findById(Long id) {
        return storeRepository.findById(id);
    }

    @Override
    public List<Store> findAll() {
        return storeRepository.findAll();
    }

    @Override
    public List<Store> findBySellerId(Long sellerId) {
        return storeRepository.findBySellerId(sellerId);
    }
}