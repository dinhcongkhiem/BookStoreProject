package com.project.book_store_be.Response.VoucherRes;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
@Data
@Builder
public class VoucherInOrderResponse {
    private String code;
    private BigDecimal value;

}
