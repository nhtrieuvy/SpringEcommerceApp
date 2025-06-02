package com.ecommerce.pojo;

import jakarta.persistence.*;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.Set;
import java.util.Date;


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

    
    public boolean isValid() {
        return name != null && !name.trim().isEmpty() && seller != null;
    }

    
    public static Builder builder() {
        return new Builder();
    }

    
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


    
    public Long getId() {
        return id;
    }

    
    public void setId(Long id) {
        this.id = id;
    }

    
    public String getName() {
        return name;
    }

    
    public void setName(String name) {
        this.name = name;
    }



    public String getDescription() {
        return description;
    }

    
    public void setDescription(String description) {
        this.description = description;
    }

  
    public String getAddress() {
        return address;
    }

   
    public void setAddress(String address) {
        this.address = address;
    }

  
    public String getLogo() {
        return logo;
    }

   
    public void setLogo(String logo) {
        this.logo = logo;
    }

    
    public boolean isActive() {
        return active;
    }

    
    public void setActive(boolean active) {
        this.active = active;
    }

   
    public User getSeller() {
        return seller;
    }

    
    public void setSeller(User seller) {
        this.seller = seller;
    }

    
    public Set<Product> getProducts() {
        return products;
    }  
      
    public void setProducts(Set<Product> products) {
        this.products = products;
    }

    
    public Date getCreatedDate() {
        return createdDate;
    }    
    
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
