package com.project.book_store_be.Services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Model.Address;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Response.FeeResponse;
import com.project.book_store_be.Response.GHTKRequest;
import com.project.book_store_be.Response.GHTKResponse;
import com.project.book_store_be.Response.GHTKStatusResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.io.ByteArrayInputStream;
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
        Address addressModel = currentUser.getAddress();
        String province = "";
        String district = "";
        String ward = "";
        String address = "";
        if (addressModel != null) {
            province = addressModel.getProvince().getLabel();
            district = addressModel.getDistrict().getLabel();
            ward = addressModel.getCommune().getLabel();
            address = addressModel.getAddressDetail();
        }


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

    //Đăng Đơn
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


   //Trạng Thái
    public GHTKStatusResponse getTrackingStatus(String trackingOrder) {
        String url = ghtkApiUrl + "/services/shipment/v2/" + trackingOrder;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<GHTKStatusResponse> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, GHTKStatusResponse.class);
        return response.getBody();
    }


    //in hoá đơn
    public ResponseEntity<InputStreamResource> getLabel(String trackingOrder, String original, String paperSize) {
        String url = String.format(ghtkApiUrl +  "/services/label/%s?original=%s&paper_size=%s", trackingOrder, original, paperSize);
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
        if (response.getStatusCode() == HttpStatus.OK) {
            ByteArrayInputStream bis = new ByteArrayInputStream(response.getBody());
            InputStreamResource resource = new InputStreamResource(bis);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } else {
            throw new RuntimeException("Không thể lấy nhãn đơn hàng: " + response.getStatusCode());
        }
    }
    //Huỷ đơn
    public ResponseEntity<String> cancelOrder(String trackingOrder, boolean usePartnerId) {
        String url = ghtkApiUrl + "/services/shipment/cancel/" + trackingOrder;
        HttpHeaders headers = new HttpHeaders();
        headers.set("Token", apiToken);
        headers.set("Content-Type", "application/json");
        HttpEntity<String> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
    }


}