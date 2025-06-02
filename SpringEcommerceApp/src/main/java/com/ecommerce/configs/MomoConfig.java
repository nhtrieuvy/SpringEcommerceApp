package com.ecommerce.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
// @PropertySource("classpath:application.properties")
public class MomoConfig {

    @Value("${momo.partnerCode:MOMO}")
    private String partnerCode;

    @Value("${momo.accessKey:F8BBA842ECF85}")
    private String accessKey;

    @Value("${momo.secretKey:K951B6PE1waDMi640xX08PD3vg6EkVlz}")
    private String secretKey;
    @Value("${momo.endpoint:https://test-payment.momo.vn/v2/gateway/api/create}")
    private String endpoint;
    @Value("${momo.returnUrl:https://d0d3-2405-4802-37-ca00-5cb4-2712-7f6b-9f68.ngrok-free.app/SpringEcommerceApp-1.0-SNAPSHOT/api/payments/momo/return}")
    private String returnUrl;
    @Value("${momo.notifyUrl:https://d0d3-2405-4802-37-ca00-5cb4-2712-7f6b-9f68.ngrok-free.app/SpringEcommerceApp-1.0-SNAPSHOT/api/payments/momo/notify}")
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

    // public String getApiEndpoint() {
    // return apiEndpoint;
    // }

    // If the MoMo SDK requires an initialized client object (like PayPal's
    // APIContext),
    // you would create a @Bean method here to provide it.
    // For example:
    /*
     * @Bean
     * public MomoClient momoClient() {
     * // Initialize and configure your MoMo client using the properties above
     * // This is highly dependent on the specific MoMo SDK
     * MomoClient client = new MomoClient(partnerCode, accessKey, secretKey);
     * // any other configurations
     * return client;
     * }
     */

    // For now, this config class primarily makes the credentials available.
    // The actual usage will depend on how MoMo's API or SDK works.
}
