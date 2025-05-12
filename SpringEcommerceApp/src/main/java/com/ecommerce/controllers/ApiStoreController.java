package com.ecommerce.controllers;

import com.ecommerce.pojo.Store;
import com.ecommerce.services.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stores")
public class ApiStoreController {
    @Autowired
    private StoreService storeService;

    @PostMapping("")
    public void createStore(@RequestBody Store store) {
        storeService.save(store);
    }

    @GetMapping("")
    public List<Store> getAllStores() {
        return storeService.findAll();
    }

    @GetMapping("/seller/{sellerId}")
    public List<Store> getStoresBySeller(@PathVariable Long sellerId) {
        return storeService.findBySellerId(sellerId);
    }
}
