package com.project.book_store_be.Request;

import com.project.book_store_be.Model.Order;
import com.project.book_store_be.Model.OrderDetail;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Response.GHTKRequest;
import com.project.book_store_be.util.GHTKConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class GHTKMapper {
    @Autowired
    private GHTKConfig ghtkConfig; // Inject GHTKConfig để lấy điểm lấy hàng cố định

    public GHTKRequest mapToGHTKRequest(Order order) {
        List<OrderDetail> orderItems = order.getOrderDetails();
        BigDecimal[] totalPrice = {BigDecimal.ZERO};

        orderItems.forEach(o -> {
            Product product = o.getProduct();
            BigDecimal discount = o.getDiscount() != null ? o.getDiscount() : BigDecimal.ZERO;
            totalPrice[0] = totalPrice[0].add(product.getPrice().subtract(discount).multiply(BigDecimal.valueOf(o.getQuantity())));
        });

        List<Product> products = new ArrayList<>();
        List<OrderDetail> orderDetails = order.getOrderDetails();
        for(OrderDetail orderDetail: orderDetails){
            Product product = orderDetail.getProduct();
            products.add(product);
        }
        // Sử dụng GHTKConfig để lấy thông tin điểm lấy hàng
        GHTKRequest.Order ghtkOrder = GHTKRequest.Order.builder()
                .id(order.getId().toString()) // Chuyển đổi ID thành chuỗi nếu cần
                .pick_name("Tên người gửi cố định") // Thêm tên người gửi cố định
                .pick_money(0) // Số tiền thu hộ, giả sử là 0 (hoặc thay đổi nếu cần)
                .pick_address(ghtkConfig.getPickup().getAddress())
                .pick_province(ghtkConfig.getPickup().getProvince())
                .pick_district(ghtkConfig.getPickup().getDistrict())
                .pick_tel("Số điện thoại cố định của người gửi") // Thêm số điện thoại cố định
                .name(order.getBuyerName()) // Tên người nhận từ Order entity
                .address(order.getAddress().getAddressDetail()) // Địa chỉ người nhận từ Order entity
                .province(order.getAddress().getProvince().getValue()) // Tỉnh người nhận từ Order entity
                .district(order.getAddress().getDistrict().getValue()) // Quận/Huyện người nhận từ Order entity
                .hamlet(order.getAddress().getCommune().getValue()) // Ấp/Xã từ Order entity
                .tel(order.getBuyerPhoneNum()) // Số điện thoại người nhận từ Order entity
                .email(order.getUser().getEmail()) // Email người nhận từ Order entity
                .value(totalPrice) // Giá trị đơn hàng
                .build();
        return GHTKRequest.builder()
                .order(ghtkOrder)
                .products(products) // Danh sách sản phẩm từ Order entity
                .build();
    }
}
