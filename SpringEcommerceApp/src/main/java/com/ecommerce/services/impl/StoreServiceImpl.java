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
    public Store save(Store store) {
        storeRepository.save(store);
        return store;
    }

    @Override
    public Store update(Store store) {
        try {
            System.out.println("Updating store in service layer: " + store.getId());
            storeRepository.update(store);
            System.out.println("Store updated successfully in repository");

            Store updatedStore = findById(store.getId());
            System.out.println("Retrieved updated store with all collections loaded");
            return updatedStore;
        } catch (Exception e) {
            System.err.println("Error updating store in service layer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public boolean delete(Long id) {
        try {
            System.out.println("Deleting store with ID: " + id + " from service layer");
            storeRepository.delete(id);
            System.out.println("Store deleted successfully");
            return true;
        } catch (Exception e) {
            System.err.println("Error deleting store in service layer: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
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

        store.setActive(!store.isActive());
        storeRepository.update(store);
        return true;
    }
}