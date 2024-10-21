package com.project.book_store_be.Controller;

import com.project.book_store_be.Interface.GHTKService;
import com.project.book_store_be.Response.FeeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/ghtk")
public class ShippingController {
    @Autowired
    private GHTKService shipmentService;

    @GetMapping("/fee")
    public BigDecimal calculateShipmentFee(
            @RequestParam String province,
            @RequestParam String district,
            @RequestParam(required = false) String ward,
            @RequestParam(required = false) String street,
            @RequestParam(required = false) String address,
            @RequestParam int weight,
            @RequestParam(required = false) Integer value,
            @RequestParam String deliverOption) {

        return shipmentService.getShipmentTotalFee(province, district, ward, street, address, weight, value, deliverOption);
    }
}
