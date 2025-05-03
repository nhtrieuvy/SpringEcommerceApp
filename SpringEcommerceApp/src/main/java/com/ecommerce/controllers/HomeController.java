/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ecommerce.controllers;

import com.ecommerce.pojo.Product;
import com.ecommerce.services.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.List;

/**
 *
 * @author nhanh
 */
// ĐÃ COMMENT TOÀN BỘ CONTROLLER NÀY ĐỂ ĐẢM BẢO CHỈ CÓ REST API, KHÔNG TRẢ VỀ VIEW CHO SPA.
// @Controller
// public class HomeController {
//     @Autowired
//     private ProductService productService;

//     @GetMapping("/")
//     public String home(Model model,
//                        @RequestParam(value = "q", required = false) String keyword) {
//         List<Product> products = (keyword == null || keyword.isEmpty())
//             ? productService.findAll()
//             : productService.findByName(keyword);
//         model.addAttribute("products", products);
//         model.addAttribute("q", keyword);
//         return "home";
//     }
// }
