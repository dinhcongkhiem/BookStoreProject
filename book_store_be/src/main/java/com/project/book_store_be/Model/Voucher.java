package com.project.book_store_be.Model;

import com.project.book_store_be.Enum.VoucherStatus;
import com.project.book_store_be.Enum.VoucherType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Data

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "voucher")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String code;
    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer quantity;
    private VoucherType discountType;
    private VoucherStatus status;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal condition;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    @OneToMany(mappedBy = "voucher")
    private List<Order> orders;
}
