package com.project.book_store_be.Controller;

import com.project.book_store_be.Enum.Interface.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/checkout")
@RequiredArgsConstructor
public class CheckoutController {
    private final CheckoutService checkoutService;


    @Validated
    @GetMapping
    private ResponseEntity<?> getCheckoutData(
            @RequestParam(required = false) List<Long> cartIds,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer qty,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String commune,
            @RequestParam(required = false) String detail) {

        if (cartIds != null && !cartIds.isEmpty()) {
            if (productId != null || qty != null) {
                return ResponseEntity.badRequest().body("Nếu có cartIds, thì productId và qty phải là null.");
            }
            return ResponseEntity.ok(checkoutService.getCheckoutData(cartIds, null, null,
                    province, district, commune, detail));
        } else {
            if (productId == null || qty == null) {
                return ResponseEntity.badRequest().body("Nếu không có cartIds, thì productId và qty phải có giá trị.");
            }
            return ResponseEntity.ok(checkoutService.getCheckoutData(null, productId, qty,
                    province, district, commune, detail));
        }
    }

    @GetMapping("/re-checkout")
    private ResponseEntity<?> reCheckout(@RequestParam(required = false) Long orderId) {
        return ResponseEntity.ok(checkoutService.reCheckout(orderId));
    }

}
