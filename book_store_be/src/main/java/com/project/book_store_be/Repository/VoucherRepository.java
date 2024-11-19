package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.User;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Enum.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Optional<Voucher> findByCode(String code);


    @Query(value = """
            SELECT *\s
            FROM voucher v 
            JOIN voucher_user vu ON v.id = vu.voucher_id
            where vu.user_id = :user_id
                    """, nativeQuery = true)
    Page<Voucher> findByUsersIs(Long user_id, Pageable pageable);

    @Query(value = """
            SELECT *\s
            FROM voucher v
            where\s
               (:keyword IS NULL OR
                           UPPER(v.code) LIKE concat('%', UPPER(:keyword), '%')
                           OR UPPER(v.name) LIKE concat('%', UPPER(:keyword), '%'))
                  AND ((:status IS NULL)
                              OR (:status = 0 AND v.start_date  > current_date)
                              OR (:status = 1 AND v.start_date  <= current_date AND v.end_date  >= current_date)
                              OR (:status = -1 AND v.end_date < current_date))
                    """, nativeQuery = true)
    Page<Voucher> searchVoucher(String keyword, Integer status, Pageable pageable);
}
