package com.project.book_store_be.Interface;

import com.project.book_store_be.Request.PaymentRequest;
import com.project.book_store_be.Response.PaymentResponse;
import vn.payos.type.Webhook;

import java.math.BigDecimal;

public interface PaymentService {
    PaymentResponse PaymentRequest(PaymentRequest request) throws Exception;

    String UpdateStatus(Webhook webhook);
    String cancelPayment(Long orderCode) throws Exception;
}
