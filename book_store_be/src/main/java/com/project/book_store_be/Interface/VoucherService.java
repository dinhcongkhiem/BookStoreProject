package com.project.book_store_be.Interface;

import com.project.book_store_be.Enum.VoucherStatus;
import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherRes.VoucherResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface VoucherService {
    Voucher createVoucher(VoucherRequest voucherRequest);
    Voucher getVoucherById(Long id);

    Page<?> getByUser(Integer page, Integer size);
    Voucher updateVoucher(Long id, VoucherRequest voucherRequest);
    void deleteVoucher(Long id);
    void validateVoucherRequest(VoucherRequest voucherRequest);
    Page<?> searchVouchers(String keyword, Integer status, int page, int size, String sort);
    VoucherResponse mapToResponse(Voucher voucher);
    void updateQuantity(Long id, Integer quantity);
}
