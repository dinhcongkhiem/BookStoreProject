package com.project.book_store_be.Services;

import com.project.book_store_be.Response.GHTKStatusResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
@Service
public class GHTKStatusService {
    @Value("${ghtk.api.token}")
    private String apiToken;

    @Value("${ghtk.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();



    public GHTKStatusResponse getTrackingStatus(String trackingOrder) {
        String url = apiUrl + "/services/shipment/v2/" + trackingOrder;


        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<GHTKStatusResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, GHTKStatusResponse.class);

        return response.getBody();
    }
}
