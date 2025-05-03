package com.ecommerce.controllers;

import com.ecommerce.pojo.Product;
import com.ecommerce.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/home")
public class ApiHomeController {
    @Autowired
    private ProductService productService;

    @GetMapping("")
    public List<Product> getHomeProducts(@RequestParam(value = "q", required = false) String keyword) {
        if (keyword == null || keyword.isEmpty())
            return productService.findAll();
        return productService.findByName(keyword);
    }
}