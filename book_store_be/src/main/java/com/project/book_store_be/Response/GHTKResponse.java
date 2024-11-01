package com.project.book_store_be.Response;

import com.project.book_store_be.Model.Product;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GHTKResponse {
    private boolean success;
    private String message;
    private OrderInfo order;
    @Data
    @Builder
    public static class OrderInfo {
        private String partnerId;
        private String label;
        private String area;
        private String fee;
        private String insurance_fee;
        private String estimated_pick_time;
        private String estimated_deliver_time;
        private List<Product> products;
        private int status_id;

    }
}
