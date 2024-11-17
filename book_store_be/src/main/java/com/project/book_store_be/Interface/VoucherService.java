package com.project.book_store_be.Interface;

import com.project.book_store_be.Enum.VoucherStatus;
import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface VoucherService {
    Voucher createVoucher(VoucherRequest voucherRequest);
    Voucher getVoucherById(Long id);
    Voucher updateVoucher(Long id, VoucherRequest voucherRequest);
    void deleteVoucher(Long id);
    void validateVoucher(BigDecimal discountValue, VoucherType discountType, BigDecimal maxDiscountValue, BigDecimal condition);
    Page<Voucher> searchVouchers(String name, VoucherStatus status, int page, int size);
    VoucherResponse mapToResponse(Voucher voucher);
}
