package com.ecommerce.controllers;
import com.ecommerce.pojo.User;
import com.ecommerce.services.UserService;
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
        return "user-list";
    }
    @GetMapping("/{id}")
    public String userDetail(@PathVariable Long id, Model model) {
        User user = userService.findById(id);
        model.addAttribute("user", user);
        return "user-detail";
    }
}
