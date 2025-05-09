package com.ecommerce.services;

import com.ecommerce.pojo.SellerRequest;
import com.ecommerce.pojo.User;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface SellerRequestService {
    /**
     * Tạo một yêu cầu đăng ký người bán mới
     * @param user Người dùng đăng ký
     * @param data Dữ liệu đăng ký
     * @param idCardFront Ảnh CMND/CCCD mặt trước (có thể null)
     * @param idCardBack Ảnh CMND/CCCD mặt sau (có thể null)
     * @param businessLicense Ảnh giấy phép kinh doanh (có thể null)
     * @return Yêu cầu đã được tạo
     */
    SellerRequest registerSeller(User user, Map<String, String> data, 
                                MultipartFile idCardFront, 
                                MultipartFile idCardBack, 
                                MultipartFile businessLicense);
    
    /**
     * Phê duyệt yêu cầu đăng ký người bán
     * @param requestId ID của yêu cầu
     * @param adminUsername Username của admin/staff thực hiện phê duyệt
     * @param notes Ghi chú bổ sung (có thể null)
     * @return Yêu cầu đã được phê duyệt
     */
    SellerRequest approveRequest(Long requestId, String adminUsername, String notes);
    
    /**
     * Từ chối yêu cầu đăng ký người bán
     * @param requestId ID của yêu cầu
     * @param adminUsername Username của admin/staff thực hiện từ chối
     * @param reason Lý do từ chối
     * @return Yêu cầu đã bị từ chối
     */
    SellerRequest rejectRequest(Long requestId, String adminUsername, String reason);
    
    /**
     * Kiểm tra xem người dùng có yêu cầu đăng ký nào chưa được xử lý (PENDING) hay không
     * @param user Người dùng cần kiểm tra
     * @return Yêu cầu đang chờ xử lý, hoặc null nếu không có
     */
    SellerRequest getPendingRequest(User user);
    
    /**
     * Lấy trạng thái yêu cầu đăng ký mới nhất của người dùng
     * @param user Người dùng cần kiểm tra
     * @return Trạng thái (PENDING, APPROVED, REJECTED) hoặc null nếu chưa có yêu cầu nào
     */
    String getRequestStatus(User user);
    
    SellerRequest findById(Long id);
    
    List<SellerRequest> findAll();
    
    List<SellerRequest> findByStatus(String status);
}
