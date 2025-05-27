package com.ecommerce.pojo;

import jakarta.persistence.*;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.HashSet;
import java.util.Set;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "stores")
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;    private String description;
    private String address;
    private String logo;
    private boolean active = true;
    
    @Column(name = "created_date")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdDate;
    
    @ManyToOne
    @JoinColumn(name = "seller_id")
    @JsonIgnoreProperties({ "stores", "password", "roles" })
    private User seller;
    @OneToMany(mappedBy = "store", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("store")
    private Set<Product> products;

    // Thêm các phương thức kinh doanh/validation
    public boolean isValid() {
        return name != null && !name.trim().isEmpty() && seller != null;
    }

    // Builder method cho việc tạo Store (OOP pattern)
    public static Builder builder() {
        return new Builder();
    }

    // Builder pattern implementation
    public static class Builder {
        private Store store = new Store();

        public Builder withName(String name) {
            store.setName(name);
            return this;
        }

        public Builder withDescription(String description) {
            store.setDescription(description);
            return this;
        }

        public Builder withAddress(String address) {
            store.setAddress(address);
            return this;
        }

        public Builder withSeller(User seller) {
            store.setSeller(seller);
            return this;
        }

        public Builder withActive(boolean active) {
            store.setActive(active);
            return this;
        }

        public Store build() {
            if (!store.isValid()) {
                throw new IllegalStateException("Store must have a name and seller");
            }
            return store;
        }
    }

    /**
     * @return the id
     */
    public Long getId() {
        return id;
    }

    /**
     * @param id the id to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the name
     */
    public String getName() {
        return name;
    }

    /**
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return the address
     */
    public String getAddress() {
        return address;
    }

    /**
     * @param address the address to set
     */
    public void setAddress(String address) {
        this.address = address;
    }

    /**
     * @return the logo
     */
    public String getLogo() {
        return logo;
    }

    /**
     * @param logo the logo to set
     */
    public void setLogo(String logo) {
        this.logo = logo;
    }

    /**
     * @return the active
     */
    public boolean isActive() {
        return active;
    }

    /**
     * @param active the active to set
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * @return the seller
     */
    public User getSeller() {
        return seller;
    }

    /**
     * @param seller the seller to set
     */
    public void setSeller(User seller) {
        this.seller = seller;
    }

    /**
     * @return the products
     */
    public Set<Product> getProducts() {
        return products;
    }    /**
     * @param products the products to set
     */
    public void setProducts(Set<Product> products) {
        this.products = products;
    }

    /**
     * @return the createdDate
     */
    public Date getCreatedDate() {
        return createdDate;
    }    /**
     * @param createdDate the createdDate to set
     */
    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = new Date();
        }
    }

}
