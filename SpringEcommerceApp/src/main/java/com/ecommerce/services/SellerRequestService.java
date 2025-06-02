package com.ecommerce.services;

import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import com.ecommerce.dtos.SellerRequestDTO;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface SellerRequestService {

    SellerRequest registerSeller(User user, Map<String, String> data, 
                                MultipartFile idCardFront, 
                                MultipartFile idCardBack, 
                                MultipartFile businessLicense);
    

    SellerRequest approveRequest(Long requestId, String adminUsername, String notes);
    

    SellerRequest rejectRequest(Long requestId, String adminUsername, String reason);
    

    SellerRequest getPendingRequest(User user);
    

    String getRequestStatus(User user);
    
    SellerRequest findById(Long id);
    
    List<SellerRequest> findAll();

    List<SellerRequestDTO> findAllSellerRequestsAsDTO();

    List<SellerRequestDTO> findSellerRequestsByStatusAsDTO(String status);
    

    Map<String, Object> getSellerRequestsPaginated(int page, int size, String status, String sortBy, String sortDir);
    
    List<SellerRequest> findByStatus(String status);
}
