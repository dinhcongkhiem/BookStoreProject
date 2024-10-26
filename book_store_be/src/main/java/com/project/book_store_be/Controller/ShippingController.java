package com.project.book_store_be.Controller;

import com.project.book_store_be.Interface.ShippingService;
import com.project.book_store_be.Response.FeeResponse;
import org.springframework.beans.factory.annotation.Autowired;
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
}
