package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherRes.VoucherResponse;
import com.project.book_store_be.Enum.Interface.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/voucher")
public class VoucherController {

    private final VoucherService voucherService;

    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createVoucher(@RequestBody VoucherRequest voucherRequest) {
        try {
            Voucher voucher = voucherService.createVoucher(voucherRequest);
            VoucherResponse response = voucherService.mapToResponse(voucher, false);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @GetMapping("/by-user")
    public ResponseEntity<?> getVoucherByUser(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "create_date") String sort
    ) {
        try {
            return ResponseEntity.ok(voucherService.searchVouchers(keyword, 1, page, size, sort, true));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping()
    public ResponseEntity<?> searchVouchers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "create_date") String sort) {
        return ResponseEntity.ok(voucherService.searchVouchers(keyword, status, page, size, sort, false));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateVoucher(
            @PathVariable Long id,
            @RequestBody VoucherRequest voucherRequest) {
        try {
            Voucher voucher = voucherService.updateVoucher(id, voucherRequest);
            VoucherResponse response = voucherService.mapToResponse(voucher, false);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("detail")
    public ResponseEntity<?> getVoucherById(@RequestParam Long id) {
        try {
            Voucher voucher = voucherService.getVoucherById(id);
            VoucherResponse response = voucherService.mapToResponse(voucher, true);
            return ResponseEntity.ok(response);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVoucher(@PathVariable Long id) {
        try {
            voucherService.deleteVoucher(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Voucher not found.");
        }
    }


}
