package com.project.book_store_be.Services;

import com.project.book_store_be.Interface.GHTKService;
import com.project.book_store_be.Response.FeeResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GHTKServiceImpl implements GHTKService {

        private final RestTemplate restTemplate;

        @Value("${ghtk.api.url}")
        private String ghtkApiUrl;

        @Value("${ghtk.api.token}")
        private String apiToken;



        public GHTKServiceImpl(RestTemplate restTemplate) {
                this.restTemplate = restTemplate;
        }

        @Override
        public FeeResponse calculateShippingFee(String pickProvince, String pickDistrict, String province, String district, int weight, int value, String deliverOption) {
                String url = ghtkApiUrl + "/services/shipment/fee?" +
                        "pick_province=" + pickProvince +
                        "&pick_district=" + pickDistrict +
                        "&province=" + province +
                        "&district=" + district +
                        "&weight=" + weight +
                        "&value=" + value +
                        "&deliver_option=" + deliverOption;

                HttpHeaders headers = new HttpHeaders();
                headers.set("Token", apiToken);


                HttpEntity<String> entity = new HttpEntity<>(headers);

                ResponseEntity<FeeResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, FeeResponse.class);

                return response.getBody();
        }



}
