package com.project.book_store_be.Controller;

import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Response.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ghtk")
public class ShippingController {
    private final ShippingService shippingService;
    @Autowired
    public ShippingController(ShippingService shippingService) {
        this.shippingService = shippingService;
    }

    @GetMapping("/calculate-fee")
    public ResponseEntity<FeeResponse> calculateShippingFee(
            @RequestParam String province,
            @RequestParam String district,
            @RequestParam String ward,
            @RequestParam String address,
            @RequestParam int weight,
            @RequestParam(required = false, defaultValue = "0") BigDecimal value
    ) {
        FeeResponse feeResponse = shippingService.calculateShippingFee(weight, value);
        return ResponseEntity.ok(feeResponse);
    }
//    đăng đơn
    @PostMapping
    public GHTKResponse createOrder(@RequestBody Long id) {
        return shippingService.createOrder(id);
    }
    //trạng thái
    @GetMapping("/tracking/{trackingOrder}")
    public ResponseEntity<GHTKStatusResponse> getOrderStatus(@PathVariable String trackingOrder) {
        GHTKStatusResponse response = shippingService.getTrackingStatus(trackingOrder);
        if (response != null && response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(500).body(response);
        }
    }
    //in hoá đơn
    @GetMapping("/label")
    public ResponseEntity<InputStreamResource> getGhtkLabel(
            @RequestParam String trackingOrder,
            @RequestParam(defaultValue = "portrait") String original,
            @RequestParam(defaultValue = "A6") String paperSize
    ) {
        return shippingService.getLabel(trackingOrder, original, paperSize);
    }

    //Huỷ đơn
    @PostMapping("/cancel/{trackingOrder}")
    public ResponseEntity<String> cancelOrder(
            @PathVariable String trackingOrder,
            @RequestParam(defaultValue = "false") boolean usePartnerId
    ) {
        return shippingService.cancelOrder(trackingOrder, usePartnerId);
    }

    @PostMapping("/updateShipment")
    public ResponseEntity<String> handleGHTKWebhook(
            @RequestParam("hash") String hash,
            @RequestBody GHTKWebhookPayload payload) {
        System.out.println("Received webhook update for order: " + payload.getLabelId());
        System.out.println("Status: " + payload.getStatusId());
        return ResponseEntity.ok("Update received");
    }


}
