package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class StreamBarcodeResponse {
    private String value;
    private Boolean error;
}
