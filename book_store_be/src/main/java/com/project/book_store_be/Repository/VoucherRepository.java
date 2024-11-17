package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Enum.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);

    Page<Voucher> findByNameContaining(String name, Pageable pageable);
    Page<Voucher> findByStatus(VoucherStatus status, Pageable pageable);
    Page<Voucher> findByNameContainingAndStatus(String name, VoucherStatus status, Pageable pageable);

}
