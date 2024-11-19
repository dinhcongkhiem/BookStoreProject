package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.VoucherType;
import com.project.book_store_be.Interface.VoucherService;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Model.Voucher;
import com.project.book_store_be.Repository.UserRepository;
import com.project.book_store_be.Repository.VoucherRepository;
import com.project.book_store_be.Request.VoucherRequest;
import com.project.book_store_be.Response.VoucherRes.VoucherResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    public Page<?> searchVouchers(String keyword, Integer status, int page, int size, String sort) {
        Sort c = switch (sort) {
            case "code_asc" -> Sort.by(Sort.Direction.ASC, "code");
            case "code_desc" -> Sort.by(Sort.Direction.DESC, "code");
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc" -> Sort.by(Sort.Direction.DESC, "name");
            case "start_asc" -> Sort.by(Sort.Direction.ASC, "start_date");
            case "start_desc" -> Sort.by(Sort.Direction.DESC, "start_date");
            case "end_asc" -> Sort.by(Sort.Direction.ASC, "end_date");
            case "end_desc" -> Sort.by(Sort.Direction.DESC, "end_date");
            default -> Sort.by(Sort.Direction.DESC, "create_date");
        };
        Pageable pageable = PageRequest.of(page, size, c);
        return voucherRepository.searchVoucher(keyword, status, pageable).map(this::mapToResponse);
    }

    @Override
    public void validateVoucherRequest(VoucherRequest voucherRequest) {
        if (!voucherRequest.isValid()) {
            throw new IllegalArgumentException("Voucher không hợp lệ. Kiểm tra lại các giá trị như discountValue và quantity.");
        }
        if (voucherRequest.getValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
        }

        if (voucherRequest.getType() == VoucherType.PERCENT) {
            if (voucherRequest.getValue().compareTo(BigDecimal.valueOf(30)) > 0) {
                throw new IllegalArgumentException("Giảm giá phần trăm không thể vượt quá 30%.");
            }
            if (voucherRequest.getMaxValue() != null &&
                    voucherRequest.getValue().compareTo(voucherRequest.getMaxValue()) > 0) {
                voucherRequest.setMaxValue(voucherRequest.getMaxValue());
            }
        }

        if (voucherRequest.getType() == VoucherType.CASH) {
            if (voucherRequest.getValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Giảm giá phải lớn hơn 0.");
            }
        }
    }
    private List<User> getUsersForVoucher(VoucherRequest voucherRequest) {
        if (voucherRequest.getIsAll()) {
            if (voucherRequest.getUserIds().isEmpty()) {
                return userRepository.findAll();
            } else {
                return userRepository.findAllByIdNotIn(voucherRequest.getUserIds());
            }
        } else {
            return userRepository.findAllById(voucherRequest.getUserIds());
        }
    }

    @Override
    public Voucher createVoucher(VoucherRequest voucherRequest) {
        validateVoucherRequest(voucherRequest);
        List<User> users = getUsersForVoucher(voucherRequest);
        System.out.println(users.size());
        Voucher voucher = Voucher.builder()
                .code(voucherRequest.getCode())
                .name(voucherRequest.getName())
                .startDate(voucherRequest.getStartDate())
                .endDate(voucherRequest.getEndDate())
                .quantity(voucherRequest.getQuantity())
                .type(voucherRequest.getType())
                .value(voucherRequest.getValue())
                .maxValue(voucherRequest.getType() == VoucherType.PERCENT ? voucherRequest.getMaxValue() : null)
                .condition(voucherRequest.getCondition())
                .createDate(LocalDateTime.now())
                .users(users)
                .build();

        return voucherRepository.save(voucher);
    }

    @Override
    public Voucher updateVoucher(Long id, VoucherRequest voucherRequest) {
        Voucher voucher = getVoucherById(id);
        validateVoucherRequest(voucherRequest);
        List<User> users = getUsersForVoucher(voucherRequest);

        voucher.setCode(voucherRequest.getCode());
        voucher.setName(voucherRequest.getName());
        voucher.setStartDate(voucherRequest.getStartDate());
        voucher.setEndDate(voucherRequest.getEndDate());
        voucher.setQuantity(voucherRequest.getQuantity());
        voucher.setType(voucherRequest.getType());
        voucher.setValue(voucherRequest.getValue());
        voucher.setMaxValue(voucherRequest.getType() == VoucherType.PERCENT ? voucherRequest.getMaxValue() : null);
        voucher.setCondition(voucherRequest.getCondition());
        voucher.setUpdateDate(LocalDateTime.now());
        voucher.setUsers(users);

        return voucherRepository.save(voucher);
    }

    @Override
    public void updateQuantity(Long id, Integer quantity) {
        Voucher voucher = getVoucherById(id);
        voucher.setQuantity(voucher.getQuantity() - quantity);
        voucherRepository.save(voucher);
    }

    @Override
    public Voucher getVoucherById(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher không tìm thấy với id: " + id));
    }

    @Override
    public Page<?> getByUser(Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        return voucherRepository.findByUsersIs(userService.getCurrentUser().getId(),pageable).map(this::mapToResponse);
    }
    @Override
    public void deleteVoucher(Long id) {
        Voucher voucher = getVoucherById(id);
        voucherRepository.delete(voucher);
    }


    @Override
    public VoucherResponse mapToResponse(Voucher voucher) {
        return VoucherResponse.builder()
                .id(voucher.getId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .startDate(voucher.getStartDate())
                .endDate(voucher.getEndDate())
                .quantity(voucher.getQuantity())
                .value(voucher.getValue())
                .type(voucher.getType())
                .maxValue(voucher.getMaxValue())
                .condition(voucher.getCondition())
                .build();
    }
}
