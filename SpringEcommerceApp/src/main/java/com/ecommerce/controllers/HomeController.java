/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.ecommerce.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 *
 * @author nhanh
 */
@Controller
public class HomeController {
    @RequestMapping("/")
    public String home(Model m){
        System.out.println("HomeController: home() method called");
        m.addAttribute("msg", "My App");
        return "home";
    }
}
