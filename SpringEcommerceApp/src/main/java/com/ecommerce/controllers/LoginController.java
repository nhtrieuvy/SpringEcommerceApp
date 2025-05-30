package com.ecommerce.controllers;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Controller xử lý các yêu cầu liên quan đến đăng nhập/đăng xuất.
 * Tách biệt controller này giúp quản lý code tốt hơn theo nguyên tắc Single
 * Responsibility.
 */

@Controller
public class LoginController {

    @GetMapping("/login")
    public String showLoginPage(
            @RequestParam(value = "error", required = false) String error,
            @RequestParam(value = "logout", required = false) String logout,
            Model model,
            HttpServletRequest request) {

        if (error != null) {
            model.addAttribute("error", "Tên đăng nhập hoặc mật khẩu không đúng!");
        }   

        if (logout != null) {
            model.addAttribute("message", "Bạn đã đăng xuất thành công!");
        }

        // Redirect to admin dashboard if user is already logged in
        HttpSession session = request.getSession(false);
        if (session != null && request.getUserPrincipal() != null) {
            return "redirect:/admin";
        }
        return "login";
    }
}