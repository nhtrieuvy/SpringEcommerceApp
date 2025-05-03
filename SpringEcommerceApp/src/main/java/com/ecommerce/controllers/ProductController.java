package com.ecommerce.controllers;

import com.ecommerce.pojo.Product;
import com.ecommerce.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import java.util.List;

// ĐÃ COMMENT TOÀN BỘ CONTROLLER NÀY ĐỂ ĐẢM BẢO CHỈ CÓ REST API, KHÔNG TRẢ VỀ VIEW CHO SPA.
// @Controller
// @RequestMapping("/products")
// public class ProductController {
//     @Autowired
//     private ProductService productService;

//     @GetMapping("")
//     public String listProducts(Model model) {
//         List<Product> products = productService.findAll();
//         model.addAttribute("products", products);
//         return "product-list";
//     }

//     @GetMapping("/{id}")
//     public String productDetail(@PathVariable("id") Long id, Model model) {
//         Product product = productService.findById(id);
//         model.addAttribute("product", product);
//         return "product-detail";
//     }
// }