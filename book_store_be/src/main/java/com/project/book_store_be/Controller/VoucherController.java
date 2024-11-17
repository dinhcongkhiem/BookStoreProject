package com.project.book_store_be.Controller;

import com.project.book_store_be.Enum.VoucherStatus;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherResponse;
import com.project.book_store_be.Interface.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping("/api/v1/admin/voucher")
    public ResponseEntity<?> createVoucher(@RequestBody VoucherRequest voucherRequest) {
        try {
            Voucher voucher = voucherService.createVoucher(voucherRequest);
            VoucherResponse response = voucherService.mapToResponse(voucher);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/api/v1/voucher/{id}")
    public ResponseEntity<?> getVoucherById(@PathVariable Long id) {
        try {
            Voucher voucher = voucherService.getVoucherById(id);
            VoucherResponse response = voucherService.mapToResponse(voucher);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        }
    }

    @PatchMapping("/api/v1/admin/voucher/{id}")
    public ResponseEntity<?> updateVoucher(
            @PathVariable Long id,
            @RequestBody VoucherRequest voucherRequest) {
        try {
            Voucher voucher = voucherService.updateVoucher(id, voucherRequest);
            VoucherResponse response = voucherService.mapToResponse(voucher);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @DeleteMapping("/api/v1/admin/voucher/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        }
    }

    @GetMapping("/api/v1/voucher/search")
    public ResponseEntity<?> searchVouchers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) VoucherStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Voucher> voucherPage = voucherService.searchVouchers(name, status, page, size);
        Page<VoucherResponse> responsePage = voucherPage.map(voucherService::mapToResponse);
        return ResponseEntity.ok(responsePage);
    }
}
