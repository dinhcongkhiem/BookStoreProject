package com.project.book_store_be.Controller;

import com.project.book_store_be.Exception.UserAlreadyExistsException;
import com.project.book_store_be.Request.ChangePasswordRequest;
import com.project.book_store_be.Request.UpdateUserRequest;
import com.project.book_store_be.Response.UserResponse;
import com.project.book_store_be.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping()
    public ResponseEntity<UserResponse> getUser() {
        return ResponseEntity.ok(userService.getUserInfor(userService.getCurrentUser()));
    }


    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(userService.getAllUser(page, size, keyword));
    }

    @PutMapping()
    public ResponseEntity<String> updateUser(@RequestBody UpdateUserRequest updateUserRequest) {
        try {
            userService.updateUser(updateUserRequest);
            return ResponseEntity.ok("Cập nhập thông tin người dùng thành công");
        } catch (UserAlreadyExistsException ex) {
            return ResponseEntity.badRequest()
                    .body("Người dùng với email " + updateUserRequest.getEmail() + " đã tồn tại.");
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            userService.changePassword(request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }


}
