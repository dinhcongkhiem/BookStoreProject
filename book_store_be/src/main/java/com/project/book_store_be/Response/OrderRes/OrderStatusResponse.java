package com.project.book_store_be.Response.OrderRes;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusResponse {
    private Long awaiting_payment;
    private Long processing;
    private Long shipping;
    private Long canceled;
    private Long completed;
    private Long all;
}
