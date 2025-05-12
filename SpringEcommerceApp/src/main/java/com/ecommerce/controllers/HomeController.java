package com.ecommerce.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 *
 * @author nhanh
 */

@Controller
public class HomeController {
    @GetMapping("/")
    public String home(Model model,
            @RequestParam(value = "q", required = false) String keyword,
            HttpServletRequest request) {
        // Check if user is authenticated and is admin
        if (request.getUserPrincipal() == null) {
            return "redirect:/login";
        }

        // Redirect to admin dashboard directly
        return "redirect:/admin";
    }
}
