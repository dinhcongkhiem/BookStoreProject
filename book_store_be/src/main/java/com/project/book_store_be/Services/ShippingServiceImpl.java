package com.project.book_store_be.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Response.FeeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;

@Service
public class ShippingServiceImpl implements ShippingService {
    private final RestTemplate restTemplate;
    private final UserService userService;
    @Value("${ghtk.api.url}")
    private String ghtkApiUrl;

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



    public ShippingServiceImpl(RestTemplate restTemplate, UserService userService) {
        this.restTemplate = restTemplate;
        this.userService = userService;
    }
    @Override
    public FeeResponse calculateShippingFee(int weight, int value, String deliverOption) {
        try {
            User currentUser = userService.getCurrentUser();
            String province = String.valueOf(currentUser.getAddress().getProvince().getLabel());
            String district = String.valueOf(currentUser.getAddress().getDistrict().getLabel());
            String ward = currentUser.getAddress().getCommune().getLabel();
            String address = currentUser.getAddress().getAddressDetail();
            System.out.println("Province: " + province);
            System.out.println("District: " + district);
            System.out.println("Ward: " + ward);
            System.out.println("Address: " + address);

            String url = ghtkApiUrl + "/services/shipment/fee?" +
                    "pick_province=" + pickProvince +
                    "&pick_district=" + pickDistrict +
                    "&pick_pickward=" + pickWard +
                    "&pick_address=" + pickAddress +
                    "&pick_district=" + pickDistrict +
                    "&province=" + province +
                    "&district=" + district +
                    "&ward=" + ward +
                    "&address=" + address +
                    "&weight=" + weight +
                    "&value=" + value +
                    "&deliver_option=" + deliverOption;


            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", apiToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            JsonNode feeObject = jsonResponse.get("fee");
            BigDecimal fee = new BigDecimal(feeObject.get("fee").asText());
            return new FeeResponse(fee);
        } catch (Exception e) {
            throw new RuntimeException("Error calculating shipping fee", e);
        }
    }

}