package com.project.book_store_be.Request;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UpdateOrderRequest {
    private Long userId;
    private String status;

}
