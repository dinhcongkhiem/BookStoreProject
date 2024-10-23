package com.project.book_store_be.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Interface.GHTKService;
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
public class GHTKServiceImpl implements GHTKService {
    private final RestTemplate restTemplate;
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

    public GHTKServiceImpl(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    @Override
    public FeeResponse calculateShippingFee(String province, String district,String ward,String address, int weight, int value, String deliverOption) {
        try {
            String url = ghtkApiUrl + "/services/shipment/fee?" +
                    "pick_province=" + pickProvince +
                    "&pick_district=" + pickDistrict +
                    "&pick_pickward=" + pickWard +
                    "&pick_address=" + pickAddress +
                    "&pick_district=" + pickDistrict +
                    "&province=" + province +
                    "&district=" + district +
                    "&district=" + ward +
                    "&district=" + address +
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