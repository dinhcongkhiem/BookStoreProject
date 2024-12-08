package com.project.book_store_be.Interface;

import com.project.book_store_be.Enum.VoucherStatus;
import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherRes.VoucherResponse;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

public interface VoucherService {
    Voucher createVoucher(VoucherRequest voucherRequest);
    Voucher getVoucherById(Long id);
    Voucher updateVoucher(Long id, VoucherRequest voucherRequest);

    void updateWhenCreateNewUser(User user);

    void deleteVoucher(Long id);
    void validateVoucherRequest(VoucherRequest voucherRequest);
    Page<?> searchVouchers(String keyword, Integer status, int page, int size, String sort, Boolean forUser);
    VoucherResponse mapToResponse(Voucher voucher, Boolean isDetail);
    @Transactional
    void returnVoucherWhenCancelOrder(Long id, User user);
    void updateQuantity(Long id, Integer quantity);
}
