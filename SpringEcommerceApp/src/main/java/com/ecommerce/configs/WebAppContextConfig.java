
package com.ecommerce.configs;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.util.List;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.SerializationFeature;

/**
 *
 * @author nhanh
 */
@Configuration
public class WebAppContextConfig implements WebMvcConfigurer {

        @Bean
        public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
                return builder -> {
                        builder.featuresToDisable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
                        builder.featuresToDisable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
                };
        }

        @Bean
        public RestTemplate restTemplate() {
                return new RestTemplate();
        }

    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        org.springframework.http.converter.ByteArrayHttpMessageConverter byteArrayConverter =
                new org.springframework.http.converter.ByteArrayHttpMessageConverter();

        List<org.springframework.http.MediaType> byteArrayMediaTypes = new java.util.ArrayList<>();
        byteArrayMediaTypes.add(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM);
        byteArrayMediaTypes.add(org.springframework.http.MediaType
                .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        byteArrayConverter.setSupportedMediaTypes(byteArrayMediaTypes);

        converters.add(byteArrayConverter);

        List<org.springframework.http.MediaType> supportedMediaTypes = new java.util.ArrayList<>();
        supportedMediaTypes.add(org.springframework.http.MediaType.APPLICATION_JSON);
        supportedMediaTypes.add(new org.springframework.http.MediaType(
                org.springframework.http.MediaType.APPLICATION_JSON.getType(),
                org.springframework.http.MediaType.APPLICATION_JSON.getSubtype(),
                java.nio.charset.StandardCharsets.UTF_8));
        supportedMediaTypes.add(org.springframework.http.MediaType.TEXT_PLAIN);
        supportedMediaTypes.add(org.springframework.http.MediaType.TEXT_HTML);
        supportedMediaTypes.add(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setSupportedMediaTypes(supportedMediaTypes);
        converters.add(jsonConverter);
    }

    @Bean
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/");
    }

}
