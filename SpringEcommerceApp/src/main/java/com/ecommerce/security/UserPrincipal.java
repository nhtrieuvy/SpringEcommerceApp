package com.ecommerce.security;

import com.ecommerce.pojo.User;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * UserPrincipal implements Spring Security's UserDetails interface.
 * This class acts as an adapter between our User entity and Spring Security's user representation.
 * Following Adapter Pattern to convert our domain model to what Spring Security expects.
 */
public class UserPrincipal implements UserDetails {
    
    private final User user;
    private final Collection<? extends GrantedAuthority> authorities;
    
    /**
     * Private constructor to enforce creation through factory method.
     * 
     * @param user The user entity
     * @param authorities The user's authorities/roles
     */
    private UserPrincipal(User user, Collection<? extends GrantedAuthority> authorities) {
        this.user = user;
        this.authorities = authorities;
    }
    
    /**
     * Factory method to create UserPrincipal from User entity.
     * 
     * @param user The user entity
     * @return A new UserPrincipal instance
     */
    public static UserPrincipal create(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // Add user roles
        if (user.getRoles() != null) {
            authorities.addAll(user.getRoles().stream()
                    .map(role -> new SimpleGrantedAuthority(role.getName()))
                    .collect(Collectors.toList()));
        }
        
        return new UserPrincipal(user, authorities);
    }
    
    /**
     * Get the original User entity.
     * 
     * @return The wrapped User entity
     */
    public User getUser() {
        return user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // We don't implement account expiration
    }

    @Override
    public boolean isAccountNonLocked() {
        return user.isActive(); // Account is locked if not active
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // We don't implement credentials expiration
    }

    @Override
    public boolean isEnabled() {
        return user.isActive();
    }
    
    /**
     * Check if the user has admin privileges.
     * 
     * @return true if user has ROLE_ADMIN
     */
    public boolean isAdmin() {
        return user.isAdmin();
    }
    
    /**
     * Check if user has a specific role.
     * 
     * @param roleName The role to check
     * @return true if user has the specified role
     */
    public boolean hasRole(String roleName) {
        return user.hasRole(roleName);
    }
}
