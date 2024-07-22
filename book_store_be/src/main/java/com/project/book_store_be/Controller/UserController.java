package com.project.book_store_be.Controller;

import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.UpdateUserRequest;
import com.project.book_store_be.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserService userService;


    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody UpdateUserRequest updateUserRequest){
        userService.updateUser(updateUserRequest);
        return ResponseEntity.ok("Cập nhập thông tin người dùng thành công");
    }
}
