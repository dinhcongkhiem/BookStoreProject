package com.project.book_store_be.Request;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.OrderDetail;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.util.GHTKConfig;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class GHTKMapper {
    private final GHTKConfig ghtkConfig;

    public GHTKMapper(GHTKConfig ghtkConfig) {
        this.ghtkConfig = ghtkConfig;
    }

    public String convertOrderToGHTKJson(Order order) {
        try {
            // Tạo một ObjectMapper để chuyển đổi dữ liệu thành JSON
            ObjectMapper objectMapper = new ObjectMapper();

            Map<String, Object> jsonMap = new HashMap<>();

            // Chuẩn bị dữ liệu để gửi đến GHTK
            Map<String, Object> orderData = new HashMap<>();
            orderData.put("id", order.getId().toString());
            orderData.put("pick_name", ghtkConfig.getPickupName());
            orderData.put("pick_money", 0);
            orderData.put("pick_address", ghtkConfig.getPickupAddress());
            orderData.put("pick_province", ghtkConfig.getPickupProvince());
            orderData.put("pick_district", ghtkConfig.getPickupDistrict());
            orderData.put("pick_ward", ghtkConfig.getPickupWard());
            orderData.put("pick_tel", ghtkConfig.getPickupPhone());
            orderData.put("tel", order.getUser().getPhoneNum());
            orderData.put("name", order.getUser().getFullName());
            orderData.put("address", order.getAddress().getCommune().getLabel());
            orderData.put("province", order.getAddress().getProvince().getLabel());
            orderData.put("district", order.getAddress().getDistrict().getLabel());
            orderData.put("hamlet", order.getAddress().getAddressDetail());
            orderData.put("email", order.getUser().getEmail());
            orderData.put("value", order.getTotalPrice());
            jsonMap.put("order", orderData);

            // Thiết lập dữ liệu cho phần "products"
            List<Map<String, Object>> productsList = new ArrayList<>();
            for (OrderDetail detail : order.getOrderDetails()) {
                Map<String, Object> productData = new HashMap<>();
                productData.put("id", detail.getProduct().getId());
                productData.put("name", detail.getProduct().getName());
                productData.put("weight", (detail.getProduct().getWeight() *0.001));
                productsList.add(productData);
            }
            jsonMap.put("products", productsList);

            return objectMapper.writeValueAsString(jsonMap);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

}
