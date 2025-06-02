package com.ecommerce.controllers;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
@Controller
public class HomeController {
    @GetMapping("/")
    public String home(Model model,
            @RequestParam(value = "q", required = false) String keyword,
            HttpServletRequest request) {
        if (request.getUserPrincipal() == null) {
            return "redirect:/login";
        }
        return "redirect:/admin";
    }
}
