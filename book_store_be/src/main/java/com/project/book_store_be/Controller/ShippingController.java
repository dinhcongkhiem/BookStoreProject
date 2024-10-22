package com.project.book_store_be.Controller;

import com.project.book_store_be.Interface.GHTKService;
import com.project.book_store_be.Response.FeeResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ghtk")
public class ShippingController {
    private final GHTKService ghtkService;

    public ShippingController(GHTKService ghtkService) {
        this.ghtkService = ghtkService;
    }

    @GetMapping("/calculate-fee")
    public ResponseEntity<FeeResponse> calculateShippingFee(
            @RequestParam String pickProvince,
            @RequestParam String pickDistrict,
            @RequestParam String province,
            @RequestParam String district,
            @RequestParam int weight,
            @RequestParam(required = false, defaultValue = "0") int value,
            @RequestParam String deliverOption
    ) {
        FeeResponse feeResponse = ghtkService.calculateShippingFee(
                pickProvince, pickDistrict, province, district, weight, value, deliverOption
        );
        return ResponseEntity.ok(feeResponse);
    }
}
