package com.project.book_store_be.Response.VoucherRes;

import com.project.book_store_be.Enum.VoucherType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@Builder
public class VoucherResponse {
    private Long id;
    private String code;
    private String name;
    private Integer quantity;
    private VoucherType type;
    private BigDecimal value;
    private BigDecimal maxValue;
    private BigDecimal condition;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
