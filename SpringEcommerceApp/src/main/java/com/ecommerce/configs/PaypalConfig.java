package com.ecommerce.configs;

import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.OAuthTokenCredential;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class PaypalConfig {

    @Value("${paypal.client.id:AU9JPC-5jvlkaN9wXRX3M0rrkqNPR7oJtpXkEbw1A2kaRmYwkGwMry4BJ3mLcPj40H-p3Kq09_qV-ZT8}")
    private String clientId;

    @Value("${paypal.client.secret:EG6hZBqV8IWF7z3IQTz52RMVkpaqFDdp2W00bQ1PdhKtVm535iIRK_7g1EWXn88EChUVBgGBhEvZiZtK}")
    private String clientSecret;

    @Value("${paypal.mode:sandbox}")
    private String mode;

    @Bean
    public Map<String, String> paypalSdkConfig() {
        Map<String, String> configMap = new HashMap<>();
        configMap.put("mode", mode);
        return configMap;
    }

    @Bean
    public OAuthTokenCredential oAuthTokenCredential() throws PayPalRESTException {
        return new OAuthTokenCredential(clientId, clientSecret, paypalSdkConfig());
    }

    @Bean
    public APIContext apiContext() throws PayPalRESTException {
        APIContext context = new APIContext(clientId, clientSecret, mode);
        context.setConfigurationMap(paypalSdkConfig());
        return context;
    }
}
