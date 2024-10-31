package com.project.book_store_be.Services;


import com.project.book_store_be.Response.GHTKRequest;
import com.project.book_store_be.Response.GHTKResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;



@Service
public class GhtkService {
    @Value("${ghtk.api.token}")
    private String apiToken;



    @Value("${ghtk.api.url}")
    private String ghtkApiUrl;
    private final RestTemplate restTemplate = new RestTemplate();
    public GHTKResponse createOrder(GHTKRequest ghtkRequest) {
        String url = ghtkApiUrl + "/services/shipment/order/?ver=1.5";
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        System.out.println(ghtkRequest);
        HttpEntity<GHTKRequest> requestEntity = new HttpEntity<>(ghtkRequest, headers);
        try {
            ResponseEntity<GHTKResponse> responseEntity = restTemplate.exchange(
                    url, HttpMethod.POST, requestEntity, GHTKResponse.class
            );
            System.out.println("ok");

            return responseEntity.getBody();

        } catch (HttpStatusCodeException e) {

            GHTKResponse errorResponse = GHTKResponse.builder()
                    .success(false)
                    .message("Error occurred: " + e.getStatusCode() + " - " + e.getResponseBodyAsString())
                    .build();
            return errorResponse;
        } catch (Exception e) {
            GHTKResponse errorResponse = GHTKResponse.builder()
                    .success(false)
                    .message("Unexpected error occurred: " + e.getMessage())
                    .build();
            return errorResponse;
        }
    }

}
