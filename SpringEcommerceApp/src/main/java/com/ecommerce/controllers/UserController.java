package com.ecommerce.controllers;

import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Controller
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("")
    public String listUsers(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "user-list"; // Tên view (user-list.html)
    }

    @GetMapping("/{id}")
    public String userDetail(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "user-detail"; // Tên view (user-detail.html)
    }

    // Có thể bổ sung các form thêm/sửa/xóa user nếu cần
}