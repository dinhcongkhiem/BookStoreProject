package com.project.book_store_be.util;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
public class GHTKConfig {
    @Value("${ghtk.pickup.province}")
    private String pickupProvince;

    @Value("${ghtk.pickup.district}")
    private String pickupDistrict;

    @Value("${ghtk.pickup.ward}")
    private String pickupWard;

    @Value("${ghtk.pickup.address}")
    private String pickupAddress;

    @Value("${ghtk.pickup.phone}")
    private String pickupPhone;

    @Value("${ghtk.pickup.name}")
    private String pickupName;

//    @Value("${ghtk.pickup.money}")
//    private String pickupMoney;
}
