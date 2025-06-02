package com.ecommerce.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.pojo.Role;
import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import com.ecommerce.dtos.SellerRequestDTO;
import com.ecommerce.repositories.SellerRequestRepository;
import com.ecommerce.services.SellerRequestService;
import com.ecommerce.services.UserService;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.Comparator;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class SellerRequestServiceImpl implements SellerRequestService {

    @Autowired
    private SellerRequestRepository sellerRequestRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private SessionFactory sessionFactory;

    @Override
    public SellerRequest registerSeller(User user, Map<String, String> data,
            MultipartFile idCardFront,
            MultipartFile idCardBack,
            MultipartFile businessLicense) {
        // Kiểm tra nếu đã có yêu cầu PENDING
        SellerRequest existingRequest = sellerRequestRepository.findPendingRequestByUser(user);
        if (existingRequest != null) {
            throw new IllegalStateException("Bạn đã có một yêu cầu đang chờ xử lý. Vui lòng đợi phê duyệt.");
        }

        // Tạo yêu cầu mới
        SellerRequest request = new SellerRequest();
        request.setUser(user);
        request.setShopName(data.get("shopName"));
        request.setDescription(data.get("description"));
        request.setAddress(data.get("address"));
        request.setTaxNumber(data.get("taxNumber"));
        request.setBankAccount(data.get("bankAccount"));
        request.setBankName(data.get("bankName"));
        request.setSellerType(data.get("sellerType"));
        request.setStatus("PENDING");
        request.setCreatedDate(new Date());

        // Upload các file nếu có
        if (idCardFront != null && !idCardFront.isEmpty()) {
            String idCardFrontUrl = uploadToCloudinary(idCardFront, "seller_requests/id_cards");
            request.setIdCardFront(idCardFrontUrl);
        }

        if (idCardBack != null && !idCardBack.isEmpty()) {
            String idCardBackUrl = uploadToCloudinary(idCardBack, "seller_requests/id_cards");
            request.setIdCardBack(idCardBackUrl);
        }

        if (businessLicense != null && !businessLicense.isEmpty()) {
            String businessLicenseUrl = uploadToCloudinary(businessLicense, "seller_requests/licenses");
            request.setBusinessLicense(businessLicenseUrl);
        }

        // Lưu yêu cầu
        return sellerRequestRepository.save(request);
    }

    @Override
    public SellerRequest approveRequest(Long requestId, String adminUsername, String notes) {
        SellerRequest request = sellerRequestRepository.findById(requestId);
        if (request == null) {
            throw new IllegalArgumentException("Không tìm thấy yêu cầu với ID: " + requestId);
        }

        // Cập nhật trạng thái yêu cầu
        request.setStatus("APPROVED");
        request.setStatusNotes(notes);
        request.setReviewedBy(adminUsername);
        request.setReviewedDate(new Date());

        // Nâng cấp vai trò của người dùng lên SELLER
        User user = request.getUser();

        Session session = sessionFactory.getCurrentSession();
        Query<Role> query = session.createQuery("FROM Role WHERE name = :name", Role.class);
        query.setParameter("name", "SELLER");
        Role sellerRole = query.uniqueResult();

        if (sellerRole == null) {
            sellerRole = new Role();
            sellerRole.setName("SELLER");
            session.persist(sellerRole);
            session.flush();
        }

        userService.addRoleToUser(user, sellerRole);

        return sellerRequestRepository.update(request);
    }

    @Override
    public SellerRequest rejectRequest(Long requestId, String adminUsername, String reason) {
        SellerRequest request = sellerRequestRepository.findById(requestId);
        if (request == null) {
            throw new IllegalArgumentException("Không tìm thấy yêu cầu với ID: " + requestId);
        }

        request.setStatus("REJECTED");
        request.setStatusNotes(reason);
        request.setReviewedBy(adminUsername);
        request.setReviewedDate(new Date());

        return sellerRequestRepository.update(request);
    }

    @Override
    public SellerRequest getPendingRequest(User user) {
        return sellerRequestRepository.findPendingRequestByUser(user);
    }

    @Override
    public String getRequestStatus(User user) {
        if (user == null) {
            return null;
        }

        for (Role role : user.getRoles()) {
            if (role.getName().equals("SELLER") || role.getName().equals("ADMIN") || role.getName().equals("STAFF")) {
                return "APPROVED";
            }
        }

        SellerRequest pendingRequest = sellerRequestRepository.findPendingRequestByUser(user);
        if (pendingRequest != null) {
            return "PENDING";
        }

        Session session = sessionFactory.getCurrentSession();
        try {
            Query<SellerRequest> query = session.createQuery(
                    "FROM SellerRequest sr WHERE sr.user.id = :userId AND sr.status = 'REJECTED' ORDER BY sr.createdDate DESC",
                    SellerRequest.class);
            query.setParameter("userId", user.getId());
            query.setMaxResults(1);
            SellerRequest rejectedRequest = query.uniqueResult();

            if (rejectedRequest != null) {
                return "REJECTED";
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    public SellerRequest findById(Long id) {
        return sellerRequestRepository.findById(id);
    }

    @Override
    public List<SellerRequest> findAll() {
        return sellerRequestRepository.findAll();
    }

    @Override
    public List<SellerRequest> findByStatus(String status) {
        return sellerRequestRepository.findByStatus(status);
    }

    @Override
    public List<SellerRequestDTO> findAllSellerRequestsAsDTO() {
        try {
            List<SellerRequest> requests = sellerRequestRepository.findAll();
            return requests.stream()
                    .map(SellerRequestDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error converting SellerRequests to DTOs: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public List<SellerRequestDTO> findSellerRequestsByStatusAsDTO(String status) {
        try {
            List<SellerRequest> requests;
            if (status == null || status.trim().isEmpty() || "ALL".equalsIgnoreCase(status)) {
                requests = sellerRequestRepository.findAll();
            } else {
                requests = sellerRequestRepository.findByStatus(status.toUpperCase());
            }
            
            return requests.stream()
                    .map(SellerRequestDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error converting SellerRequests to DTOs by status: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    @Override
    public Map<String, Object> getSellerRequestsPaginated(int page, int size, String status, String sortBy, String sortDir) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get filtered DTOs
            List<SellerRequestDTO> allRequests = findSellerRequestsByStatusAsDTO(status);
            
            // Apply sorting
            Comparator<SellerRequestDTO> comparator = getComparator(sortBy, sortDir);
            if (comparator != null) {
                allRequests.sort(comparator);
            }
            
            // Calculate pagination
            int totalElements = allRequests.size();
            int totalPages = (int) Math.ceil((double) totalElements / size);
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, totalElements);
            
            // Handle edge cases
            if (fromIndex >= totalElements) {
                fromIndex = 0;
                toIndex = Math.min(size, totalElements);
            }
            
            List<SellerRequestDTO> pagedRequests = fromIndex < toIndex
                    ? allRequests.subList(fromIndex, toIndex)
                    : List.of();
            
            // Build response
            result.put("success", true);
            result.put("content", pagedRequests);
            result.put("totalElements", totalElements);
            result.put("totalPages", totalPages);
            result.put("currentPage", page);
            result.put("pageSize", size);
            result.put("hasNext", page < totalPages - 1);
            result.put("hasPrevious", page > 0);
            result.put("first", page == 0);
            result.put("last", page >= totalPages - 1);
            
            // Add status statistics
            Map<String, Long> statusCounts = allRequests.stream()
                    .collect(Collectors.groupingBy(
                            SellerRequestDTO::getStatus,
                            Collectors.counting()
                    ));
            result.put("statusCounts", statusCounts);
            
        } catch (Exception e) {
            System.err.println("Error in paginated seller requests: " + e.getMessage());
            e.printStackTrace();
            result.put("success", false);
            result.put("message", "Error retrieving seller requests: " + e.getMessage());
            result.put("content", List.of());
            result.put("totalElements", 0);
            result.put("totalPages", 0);
        }
        
        return result;
    }
    
    /**
     * Helper method to create comparators for sorting
     */
    private Comparator<SellerRequestDTO> getComparator(String sortBy, String sortDir) {
        if (sortBy == null || sortBy.trim().isEmpty()) {
            sortBy = "createdDate"; // Default sort
        }
        
        boolean ascending = !"desc".equalsIgnoreCase(sortDir);
        
        Comparator<SellerRequestDTO> comparator;
        
        switch (sortBy.toLowerCase()) {
            case "createdate":
            case "created_date":
            case "createddate":
                comparator = Comparator.comparing(SellerRequestDTO::getCreatedDate, 
                        Comparator.nullsLast(Comparator.naturalOrder()));
                break;
            case "shopname":
            case "shop_name":
                comparator = Comparator.comparing(SellerRequestDTO::getShopName, 
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "status":
                comparator = Comparator.comparing(SellerRequestDTO::getPriorityLevel)
                        .thenComparing(SellerRequestDTO::getStatus, 
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "username":
                comparator = Comparator.comparing(SellerRequestDTO::getUsername, 
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "fullname":
                comparator = Comparator.comparing(SellerRequestDTO::getFullname, 
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
                break;
            case "priority":
                comparator = Comparator.comparing(SellerRequestDTO::getPriorityLevel);
                break;
            case "days":
            case "dayssincecreated":
                comparator = Comparator.comparing(SellerRequestDTO::getDaysSinceCreated);
                break;
            default:
                // Default to created date
                comparator = Comparator.comparing(SellerRequestDTO::getCreatedDate, 
                        Comparator.nullsLast(Comparator.naturalOrder()));
                break;
        }
        
        return ascending ? comparator : comparator.reversed();
    }

    private String uploadToCloudinary(MultipartFile file, String folder) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
        }
    }
}
