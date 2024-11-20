package com.project.book_store_be.Request;

import lombok.Data;

@Data
public class BarcodeRequest {
    private String base64Image;
    private Long orderId;
}
