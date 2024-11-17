package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.VoucherStatus;
import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Interface.VoucherService;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Repository.VoucherRepository;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;

    @Autowired
    public VoucherServiceImpl(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }
    @Override
    public Page<Voucher> searchVouchers(String name, VoucherStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (name != null && status != null) {
            return voucherRepository.findByNameContainingAndStatus(name, status, pageable);
        }
        if (name != null) {
            return voucherRepository.findByNameContaining(name, pageable);
        }
        if (status != null) {
            return voucherRepository.findByStatus(status, pageable);
        }
        return voucherRepository.findAll(pageable);
    }


    @Override
    public Voucher createVoucher(VoucherRequest voucherRequest) {
        if (!voucherRequest.isValid()) {
            throw new IllegalArgumentException("Voucher không hợp lệ. Kiểm tra lại các giá trị như discountValue và quantity.");
        }
        if (voucherRequest.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
        }

        if (voucherRequest.getDiscountType() == VoucherType.PERCENT) {
            if (voucherRequest.getDiscountValue().compareTo(BigDecimal.valueOf(30)) > 0) {
                throw new IllegalArgumentException("Giảm giá phần trăm không thể vượt quá 30%.");
            }
            if (voucherRequest.getMaxDiscountValue() != null &&
                    voucherRequest.getDiscountValue().compareTo(voucherRequest.getMaxDiscountValue()) > 0) {
                voucherRequest.setDiscountValue(voucherRequest.getMaxDiscountValue());
            }
        }

        if (voucherRequest.getDiscountType() == VoucherType.CASH) {
            if (voucherRequest.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
            }
        }

        LocalDateTime currentDateTime = LocalDateTime.now();
        Voucher voucher = Voucher.builder()
                .code(voucherRequest.getCode())
                .name(voucherRequest.getName())
                .startDate(currentDateTime)
                .endDate(voucherRequest.getEndDate())
                .quantity(voucherRequest.getQuantity())
                .discountType(voucherRequest.getDiscountType())
                .status(VoucherStatus.ACTIVE)
                .discountValue(voucherRequest.getDiscountValue())
                .maxDiscountValue(voucherRequest.getDiscountType() == VoucherType.PERCENT ? voucherRequest.getMaxDiscountValue() : null)
                .condition(voucherRequest.getCondition())
                .createDate(currentDateTime)
                .build();

        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tìm thấy với id: " + id));
    }

    @Override
    public Voucher updateVoucher(Long id, VoucherRequest voucherRequest) {
        Voucher voucher = getVoucherById(id);
        if (!voucherRequest.isValid()) {
            throw new IllegalArgumentException("Voucher không hợp lệ. Kiểm tra lại các giá trị như discountValue và quantity.");
        }

        if (voucherRequest.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
        }

        if (voucherRequest.getDiscountType() == VoucherType.PERCENT) {
            if (voucherRequest.getDiscountValue().compareTo(BigDecimal.valueOf(30)) > 0) {
                throw new IllegalArgumentException("Giảm giá phần trăm không thể vượt quá 30%.");
            }
            if (voucherRequest.getMaxDiscountValue() != null &&
                    voucherRequest.getDiscountValue().compareTo(voucherRequest.getMaxDiscountValue()) > 0) {
                voucherRequest.setDiscountValue(voucherRequest.getMaxDiscountValue());
            }
        }

        if (voucherRequest.getDiscountType() == VoucherType.CASH) {
            if (voucherRequest.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
            }
        }

        voucher.setCode(voucherRequest.getCode());
        voucher.setName(voucherRequest.getName());
        voucher.setStartDate(LocalDateTime.now());
        voucher.setEndDate(voucherRequest.getEndDate());
        voucher.setQuantity(voucherRequest.getQuantity());
        voucher.setDiscountType(voucherRequest.getDiscountType());
        voucher.setDiscountValue(voucherRequest.getDiscountValue());
        voucher.setMaxDiscountValue(voucherRequest.getDiscountType() == VoucherType.PERCENT ? voucherRequest.getMaxDiscountValue() : null);
        voucher.setCondition(voucherRequest.getCondition());
        voucher.setUpdateDate(LocalDateTime.now());

        return voucherRepository.save(voucher);
    }

    @Override
    public void deleteVoucher(Long id) {
        Voucher voucher = getVoucherById(id);
        voucherRepository.delete(voucher);
    }

    @Override
    public void validateVoucher(BigDecimal discountValue, VoucherType discountType, BigDecimal maxDiscountValue, BigDecimal condition) {
        if (discountValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (discountType == VoucherType.PERCENT) {
            discountAmount = discountValue;

            if (discountValue.compareTo(BigDecimal.valueOf(30)) > 0) {
                throw new IllegalArgumentException("Giảm giá theo phần trăm không thể vượt quá 30%.");
            }
        } else if (discountType == VoucherType.CASH) {
            discountAmount = discountValue;
        }

        if (discountAmount.compareTo(maxDiscountValue) > 0) {
            throw new IllegalArgumentException("Giảm giá không thể vượt quá " + maxDiscountValue + " đồng.");
        }
    }

    @Override
    public VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .code(voucher.getCode())
                .name(voucher.getName())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .quantity(voucher.getQuantity())
                .status(voucher.getStatus().name())
                .discountValue(voucher.getDiscountValue())
                .discountType(voucher.getDiscountType().name())
                .maxDiscountValue(voucher.getMaxDiscountValue())
                .condition(voucher.getCondition())
                .build();
    }
}
