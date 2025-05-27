package com.ecommerce.pojo;

import jakarta.persistence.*;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import java.util.Set;
import java.util.HashSet;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@NoArgsConstructor
@AllArgsConstructor
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;
    private double price;
    private int quantity;
    private String image;
    private boolean active = true;    @ManyToOne
    @JoinColumn(name = "store_id")
    @JsonIgnoreProperties("products")
    private Store store;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties("products")
    private Category category;    /**
     * Reviews for this product.
     * 
     * Note: This field is @Transient as the reviews are stored in the review_products table
     * instead of the reviews table. The actual reviews are loaded dynamically from the
     * ReviewProductService when needed rather than through Hibernate's relationships.
     */
    @Transient
    private Set<ReviewProduct> reviews;

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

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Store getStore() {
        return store;
    }

    public void setStore(Store store) {
        this.store = store;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }    public Set<ReviewProduct> getReviews() {
        // Reviews are now loaded on-demand from the database using ReviewProductRepository
        // This will be empty unless explicitly populated
        return reviews;
    }

    public void setReviews(Set<ReviewProduct> reviews) {
        this.reviews = reviews;
    }

    /**
     * Loads reviews for this product from the given ReviewProductService.
     * Call this method to manually initialize reviews before using them.
     * 
     * @param reviewService the ReviewProductService to load reviews from
     */
    public void loadReviews(com.ecommerce.services.ReviewProductService reviewService) {
        if (this.id != null) {
            java.util.List<ReviewProduct> reviewList = reviewService.getReviewsByProductId(this.id);
            this.reviews = new java.util.HashSet<>(reviewList);
        }
    }
}
