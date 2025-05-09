package com.ecommerce.repositories;

import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import java.util.List;

public interface SellerRequestRepository {
    SellerRequest save(SellerRequest sellerRequest);
    SellerRequest update(SellerRequest sellerRequest);
    SellerRequest findById(Long id);
    List<SellerRequest> findAll();
    List<SellerRequest> findByStatus(String status);
    SellerRequest findPendingRequestByUser(User user);
    void delete(Long id);
}
