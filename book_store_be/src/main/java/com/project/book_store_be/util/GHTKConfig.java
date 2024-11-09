package com.project.book_store_be.util;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "ghtk")
public class GHTKConfig {
    private Api api;
    private Pickup pickup;

    @Data
    public static class Api {
        private String url;
        private String urlProduction;
        private String token;
    }

    @Data
    public static class Pickup {
        private String province;
        private String district;
        private String ward;
        private String address;
    }
}
