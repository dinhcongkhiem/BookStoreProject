package com.project.book_store_be.Response;


import com.project.book_store_be.Model.Product;
import lombok.Builder;
import lombok.Data;

import java.util.List;
@Data
@Builder
public class GHTKRequest {
    private List<Product> products;
    private Order order;

    @Data
    @Builder
    public static class Order {
        private String id;
        private String pick_name;
        private Integer pick_money;
        private String pick_address;
        private String pick_province;
        private String pick_district;
        private String pick_tel;
        private String name;
        private String address;
        private String province;
        private String district;
        private String hamlet;
        private String tel;
        private String email;
        private Integer value;
        private String transport;

    }
}
