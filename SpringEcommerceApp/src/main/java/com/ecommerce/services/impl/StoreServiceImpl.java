package com.ecommerce.services.impl;

import com.ecommerce.pojo.Store;
import com.ecommerce.repositories.StoreRepository;
import com.ecommerce.services.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

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
        storeRepository.delete(id);
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
    public List<Store> findByUserId(Long userId) {
        return storeRepository.findByUserId(userId);
    }

    @Override
    public List<Map<String, Object>> findAllWithUserInfo() {
        return storeRepository.findAllWithUserInfo();
    }

    @Override
    public Map<String, Object> findByIdWithUserInfo(Long id) {
        return storeRepository.findByIdWithUserInfo(id);
    }

    @Override
    public boolean toggleStatus(Long id) {
        Store store = storeRepository.findById(id);
        if (store == null) {
            return false;
        }
        
        // Toggle the status
        store.setActive(!store.isActive());
        storeRepository.update(store);
        return true;
    }
}