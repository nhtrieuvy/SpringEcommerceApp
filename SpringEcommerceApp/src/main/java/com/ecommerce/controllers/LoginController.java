package com.ecommerce.controllers;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
        HttpSession session = request.getSession(false);
        if (session != null && request.getUserPrincipal() != null) {
            return "redirect:/admin";
        }
        return "login";
    }
}
