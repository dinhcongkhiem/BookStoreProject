package com.project.book_store_be.Controller;

import com.project.book_store_be.Interface.GHTKService;
import com.project.book_store_be.Response.FeeResponse;
import com.project.book_store_be.Services.GHTKServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ghtk")
public class ShippingController {
    private final GHTKService ghtkService;

    @Autowired
    public ShippingController(GHTKService ghtkService) {
        this.ghtkService = ghtkService;
    }

    @GetMapping("/calculate-fee")
    public ResponseEntity<FeeResponse> calculateShippingFee(
            @RequestParam String province,
            @RequestParam String district,
            @RequestParam String ward,
            @RequestParam String address,
            @RequestParam int weight,
            @RequestParam(required = false, defaultValue = "0") int value,
            @RequestParam String deliverOption
    ) {
        FeeResponse feeResponse = ghtkService.calculateShippingFee(
                province, district,ward,address, weight, value, deliverOption
        );
        return ResponseEntity.ok(feeResponse);
    }


}
