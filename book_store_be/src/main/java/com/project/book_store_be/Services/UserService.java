package com.project.book_store_be.Services;

import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Exception.UserAlreadyExistsException;
import com.project.book_store_be.Enum.Interface.AddressService;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.UserRepository;
import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.UpdateUserRequest;
import com.project.book_store_be.Response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AddressService addressService;
    private final SendMailService sendMailService;

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    public List<User> getAdminUser() {
        return userRepository.findByRole(Role.ADMIN);
    }

    public UserResponse getUserInfor(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .address(user.getAddress())
                .phoneNum(user.getPhoneNum())
                .role(user.getRole())
                .build();
    }

    public void changePassword(ChangePasswordRequest request) {
        User user = getCurrentUser();
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalStateException("Wrong password");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalStateException("Password are not the same");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void updateUser(UpdateUserRequest request) {
        User user = getCurrentUser();
        if (user == null) {
            throw new IllegalStateException("Bạn chưa đăng nhập");
        }
        if (!Objects.equals(request.getEmail(), user.getEmail())) {
            Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
            if (userOptional.isPresent()) {
                throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
            }

            sendMailService.sendEmail(user, "Thay đổi email (Book bazaar).",
                    "changeEmailTemplate", null);
            user.setEmail(request.getEmail());
        }

        if (!Objects.equals(request.getFullName(), user.getFullName())) {
            user.setFullName(request.getFullName());
        }

        if (!Objects.equals(request.getPhoneNum(), user.getPhoneNum())) {
            user.setPhoneNum(request.getPhoneNum());
        }

        user.setAddress(addressService.createAddress(request.getAddress()));

        userRepository.save(user);
    }


    public Page<?> getAllUser(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.searchByKeyword(keyword, pageable).map(this::getUserInfor);
    }
}
