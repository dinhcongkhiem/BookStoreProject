package com.project.book_store_be.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Response.FeeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class ShippingServiceImpl implements ShippingService {
    private final RestTemplate restTemplate;
    private final UserService userService;
    @Value("${ghtk.api.url}")
    private String ghtkApiUrl;
    @Value("${ghtk.api.urlProduction}")
    private String shippingUrlProduction;
    @Value("${ghtk.api.token}")
    private String apiToken;
    @Value("${ghtk.pickup.province}")
    private String pickProvince;
    @Value("${ghtk.pickup.district}")
    private String pickDistrict;
    @Value("${ghtk.pickup.ward}")
    private String pickWard;
    @Value("${ghtk.pickup.address}")
    private String pickAddress;

    @Autowired
    public ShippingServiceImpl(RestTemplate restTemplate, UserService userService) {
        this.restTemplate = restTemplate;
        this.userService = userService;
    }

    @Override
    public FeeResponse calculateShippingFee(String province, String district, String ward,
                                            String address, int weight, BigDecimal value) {
        log.info("Get shipping fee with new address");
        try {
            return FetchShippingFee(province, district, ward, address, weight, value).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public FeeResponse calculateShippingFee(int weight, BigDecimal value) {
        log.info("Get shipping fee with default address");

        User currentUser = userService.getCurrentUser();
        String province = String.valueOf(currentUser.getAddress().getProvince().getLabel());
        String district = String.valueOf(currentUser.getAddress().getDistrict().getLabel());
        String ward = currentUser.getAddress().getCommune().getLabel();
        String address = currentUser.getAddress().getAddressDetail();

        try {
            return FetchShippingFee(province, district, ward, address, weight, value).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @Cacheable("shippingFee")
    @Async
    public CompletableFuture<FeeResponse> FetchShippingFee(String province, String district, String ward, String address, int weight, BigDecimal value) {
        try {
            String url = shippingUrlProduction + "/services/shipment/fee?" +
                    "pick_province=" + pickProvince +
                    "&pick_district=" + pickDistrict +
                    "&pick_ward=" + pickWard +
                    "&pick_address=" + pickAddress +
                    "&province=" + province +
                    "&district=" + district +
                    "&ward=" + ward +
                    "&address=" + address +
                    "&weight=" + weight +
                    "&value=" + value +
                    "&deliver_option=none";

            log.info(url);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", apiToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            JsonNode feeObject = jsonResponse.get("fee");
            BigDecimal fee = new BigDecimal(feeObject.get("fee").asText());

            log.info("Response shipping fee: " + response.getBody());
            return CompletableFuture.completedFuture(new FeeResponse(fee));
        } catch (Exception e) {
            throw new RuntimeException("Error calculating shipping fee", e);
        }
    }



}