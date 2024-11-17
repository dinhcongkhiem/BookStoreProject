package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.VoucherType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoucherRequest {

    private String code;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @Min(value = 1, message = "Quantity must be greater than 0")
    private Integer quantity;

    private VoucherType discountType;

    @NotNull(message = "Discount value cannot be null")
    private BigDecimal discountValue;

    private BigDecimal maxDiscountValue;
    private BigDecimal condition;

    @AssertTrue(message = "Discount value cannot exceed 30% for PERCENT type")
    public boolean isDiscountValueValid() {
        if (discountType == VoucherType.PERCENT) {
            if (discountValue == null || discountValue.compareTo(new BigDecimal("30")) > 0) {
                return false;
            }
            if (maxDiscountValue != null && discountValue.compareTo(maxDiscountValue) > 0) {
                return false;
            }
        }
        return true;
    }

    @AssertTrue(message = "Quantity must be greater than 0")
    public boolean isQuantityValid() {
        return quantity != null && quantity > 0;
    }

    @AssertTrue(message = "Condition must be greater than 0")
    public boolean isConditionValid() {
        return condition != null && condition.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isValid() {
        return isDiscountValueValid() && isQuantityValid() && isConditionValid();
    }
}
