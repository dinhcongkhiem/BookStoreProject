package com.project.book_store_be.Controller;

import com.project.book_store_be.Enum.Interface.PaymentService;
import com.project.book_store_be.Request.PaymentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.payos.type.Webhook;

@RestController
@RequestMapping("/api/v1/payment")
public class PaymentController {

    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping()
    public ResponseEntity<?> createPayment(@RequestBody PaymentRequest request) {
        try {
            return ResponseEntity.ok(paymentService.PaymentRequest(request));
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/cancel")
    public ResponseEntity<String> cancelPayment(@RequestParam Long orderCode) {
        try {
            String response = paymentService.cancelPayment(orderCode);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Cancel failed");
        }
    }


    @PostMapping("/webhook/status")
    public ResponseEntity<?> checkPaymentStatus(@RequestBody Webhook payload) {
        try {
            paymentService.UpdateStatus(payload);
            return ResponseEntity.status(HttpStatus.OK).build();
        }catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK).body("Khong tim thay");
        }

    }

}
