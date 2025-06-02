// package com.ecommerce.dtos;

// import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
// import lombok.Data;
// import lombok.NoArgsConstructor;
// import lombok.AllArgsConstructor;


// @Data
// @NoArgsConstructor
// @AllArgsConstructor
// @JsonIgnoreProperties(ignoreUnknown = true)
// public class UserDTO {
//     private Long id;
//     private String username;
//     private String email;
//     private String fullname;
//     private String phone;
//     private String avatar;
//     private boolean isActive;
    
    
//     private String displayName;  
    
    
//     public static UserDTO fromEntity(com.ecommerce.pojo.User user) {
//         UserDTO dto = new UserDTO();
//         dto.setId(user.getId());
//         dto.setUsername(user.getUsername());
//         dto.setEmail(user.getEmail());
//         dto.setFullname(user.getFullname());
//         dto.setPhone(user.getPhone());
//         dto.setAvatar(user.getAvatar());
//         dto.setActive(user.isActive());
        
        
//         dto.setDisplayName(user.getFullname() != null ? 
//             user.getFullname() : user.getUsername());
            
//         return dto;
//     }
// }
