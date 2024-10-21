package com.project.book_store_be.Services;

import com.project.book_store_be.Interface.GHTKService;
import com.project.book_store_be.Response.FeeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;

@Service
public class GHTKServiceImpl implements GHTKService {
    @Value("${ghtk.api.url}")
    private String apiUrl;

    @Value("${ghtk.api.token}")
    private String apiToken;



    @Value("${ghtk.pick.province}")
    private String pickProvince;

    @Value("${ghtk.pick.district}")
    private String pickDistrict;

    @Value("${ghtk.pick.ward}")
    private String pickWard;

    @Value("${ghtk.pick.street}")
    private String pickStreet;

    @Value("${ghtk.pick.address}")
    private String pickAddress;



    @Override
    public BigDecimal getShipmentTotalFee(String province, String district, String ward, String street, String address,
                                          int weight, Integer value, String deliverOption) {
        RestTemplate restTemplate = new RestTemplate();

        StringBuilder urlBuilder = new StringBuilder(apiUrl);
        urlBuilder.append("/services/shipment/fee?");
        urlBuilder.append("pick_province=").append(pickProvince);
        urlBuilder.append("&pick_district=").append(pickDistrict);

        if (pickWard != null && !pickWard.isEmpty()) {
            urlBuilder.append("&pick_ward=").append(pickWard);
        }
        if (pickStreet != null && !pickStreet.isEmpty()) {
            urlBuilder.append("&pick_street=").append(pickStreet);
        }
        if (pickAddress != null && !pickAddress.isEmpty()) {
            urlBuilder.append("&pick_address=").append(pickAddress);
        }

        urlBuilder.append("&province=").append(province);
        urlBuilder.append("&district=").append(district);
        if (ward != null && !ward.isEmpty()) {
            urlBuilder.append("&ward=").append(ward);
        }
        if (street != null && !street.isEmpty()) {
            urlBuilder.append("&street=").append(street);
        }
        if (address != null && !address.isEmpty()) {
            urlBuilder.append("&address=").append(address);
        }

        urlBuilder.append("&weight=").append(weight);
        urlBuilder.append("&deliver_option=").append(deliverOption);
        if (value != null) {
            urlBuilder.append("&value=").append(value);
        }

        String url = urlBuilder.toString();
        System.out.println("Request URL: " + url);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Token", apiToken);
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        org.springframework.http.ResponseEntity<FeeResponse> response = restTemplate.exchange(
                url, org.springframework.http.HttpMethod.GET, entity, FeeResponse.class);

        FeeResponse feeResponse = response.getBody();
        if (feeResponse == null || feeResponse.getFee() == null) {
            throw new RuntimeException("Failed to get fee information from GHTK API");
        }

        return feeResponse.getFee().getFee();
    }
}
