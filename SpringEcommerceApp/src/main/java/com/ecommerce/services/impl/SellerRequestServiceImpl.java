package com.ecommerce.services.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecommerce.pojo.Role;
import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import com.ecommerce.repositories.SellerRequestRepository;
import com.ecommerce.services.SellerRequestService;
import com.ecommerce.services.UserService;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;
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
        
        // Tìm role SELLER
        Session session = sessionFactory.getCurrentSession();
        Query<Role> query = session.createQuery("FROM Role WHERE name = :name", Role.class);
        query.setParameter("name", "SELLER");
        Role sellerRole = query.uniqueResult();
        
        if (sellerRole == null) {
            // Nếu không tìm thấy, tạo role mới
            sellerRole = new Role();
            sellerRole.setName("SELLER");
            session.persist(sellerRole);
            session.flush(); // Đảm bảo role được lưu và có ID
        }
        
        // Thêm vai trò SELLER cho người dùng
        userService.addRoleToUser(user, sellerRole);
        
        // Lưu yêu cầu
        return sellerRequestRepository.update(request);
    }

    @Override
    public SellerRequest rejectRequest(Long requestId, String adminUsername, String reason) {
        SellerRequest request = sellerRequestRepository.findById(requestId);
        if (request == null) {
            throw new IllegalArgumentException("Không tìm thấy yêu cầu với ID: " + requestId);
        }
        
        // Cập nhật trạng thái yêu cầu
        request.setStatus("REJECTED");
        request.setStatusNotes(reason);
        request.setReviewedBy(adminUsername);
        request.setReviewedDate(new Date());
        
        // Lưu yêu cầu
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
        
        // Kiểm tra xem người dùng đã là SELLER hoặc ADMIN hoặc STAFF chưa
        for (Role role : user.getRoles()) {
            if (role.getName().equals("SELLER") || role.getName().equals("ADMIN") || role.getName().equals("STAFF")) {
                return "APPROVED"; // Người dùng đã có quyền cao hơn USER
            }
        }
        
        // Tìm yêu cầu đang chờ xử lý
        SellerRequest pendingRequest = sellerRequestRepository.findPendingRequestByUser(user);
        if (pendingRequest != null) {
            return "PENDING";
        }
        
        // Tìm yêu cầu gần nhất (dựa vào createdDate) đã bị từ chối
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
        
        // Người dùng chưa có yêu cầu nào
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
    
    /**
     * Upload ảnh lên Cloudinary
     * @param file File cần upload
     * @param folder Thư mục lưu trữ trên Cloudinary
     * @return URL của ảnh đã upload
     */
    private String uploadToCloudinary(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
                )
            );
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh: " + e.getMessage());
        }
    }
}
