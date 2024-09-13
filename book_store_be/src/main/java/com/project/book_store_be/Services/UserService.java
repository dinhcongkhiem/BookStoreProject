package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Address;
import com.project.book_store_be.Model.User;
import com.project.book_store_be.Repository.AddressRepository;
import com.project.book_store_be.Repository.UserRepository;
import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.UpdateUserRequest;
import com.project.book_store_be.Response.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AddressService addressService;

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(NoSuchElementException::new);
    }
    public User getCurrentStudent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return (User) authentication.getPrincipal();
        }
        return null;
    }

    public UserResponse getUserInfor(User user){
        return UserResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .address(user.getAddress())
                .phoneNum(user.getPhoneNum())
                .role(user.getRole())
                .build();
    }
    public void changePassword(ChangePasswordRequest request){
        User user = getCurrentStudent();
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalStateException("Wrong password");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalStateException("Password are not the same");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public void updateUser(UpdateUserRequest request){
        User user =  getCurrentStudent();
        if(user == null){
            throw new IllegalStateException("Bạn chưa đăng nhập");
        }
        user.setFullName(request.getFullName());
        user.setPhoneNum(request.getPhoneNum());
        user.setAddress(addressService.createAddress(request.getAddress()));

        userRepository.save(user);
    }

}
