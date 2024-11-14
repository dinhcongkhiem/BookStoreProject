package com.project.book_store_be.Response.OrderRes;

import com.project.book_store_be.Model.Order;
import jakarta.persistence.Tuple;
import lombok.*;
import org.springframework.data.domain.Page;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
public class OrderPageResponse {
    private Page<GetAllOrderResponse> orders;
    private OrderStatusResponse count;
}

