package com.ecommerce.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MomoConfig {

    @Value("${momo.partnerCode:MOMO}")
    private String partnerCode;

    @Value("${momo.accessKey:F8BBA842ECF85}")
    private String accessKey;

    @Value("${momo.secretKey:K951B6PE1waDMi640xX08PD3vg6EkVlz}")
    private String secretKey;
    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String endpoint;
    @Value("${momo.returnUrl:https://38ed-2405-4802-813a-3050-18ef-9eaa-a3b9-da03.ngrok-free.app/SpringEcommerceApp-1.0-SNAPSHOT/api/payments/momo/return}")
    private String returnUrl;
    @Value("${momo.notifyUrl:https://38ed-2405-4802-813a-3050-18ef-9eaa-a3b9-da03.ngrok-free.app/SpringEcommerceApp-1.0-SNAPSHOT/api/payments/momo/notify}")
    private String notifyUrl;

    @Value("${momo.requestType:captureWallet}")
    private String requestType; 

    public String getPartnerCode() {
        return partnerCode;
    }

    public String getAccessKey() {
        return accessKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getEndpoint() {
        return endpoint;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public String getNotifyUrl() {
        return notifyUrl;
    }

    public String getRequestType() {
        return requestType;
    }

}
