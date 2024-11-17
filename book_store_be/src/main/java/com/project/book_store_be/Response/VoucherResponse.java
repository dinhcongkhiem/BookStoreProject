package com.project.book_store_be.Response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@Builder
public class VoucherResponse {
    private String code;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer quantity;
    private String status;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal condition;
    private String discountType;
}
