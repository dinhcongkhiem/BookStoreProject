package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Long> {
    @Query("SELECT a FROM Address a WHERE a.addressDetail LIKE :detail" +
            " AND a.province.value LIKE :provinceValue AND a.province.label LIKE :provinceLabel" +
            " AND a.district.value LIKE :districtValue AND a.district.label LIKE :districtLabel" +
            " AND a.commune.value LIKE :communeValue AND a.commune.label LIKE :communeLabel")
    Optional<Address> findTheSameAddress(
            @Param("provinceValue") String provinceValue,
            @Param("provinceLabel") String provinceLabel,
            @Param("districtValue") String districtValue,
            @Param("districtLabel") String districtLabel,
            @Param("communeValue") String communeValue,
            @Param("communeLabel") String communeLabel,
            @Param("detail") String detail
    );
}
