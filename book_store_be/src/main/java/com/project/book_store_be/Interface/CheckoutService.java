package com.project.book_store_be.Interface;


import java.util.List;
import java.util.Map;

public interface CheckoutService {
    Map<?,?> getCheckoutData(List<Long> cartIds, Long productId, Integer qty,
                             String province, String district, String commune, String detail);

    Map<?,?> reCheckout(Long orderId);
}
