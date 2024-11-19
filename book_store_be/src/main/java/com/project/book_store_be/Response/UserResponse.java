package com.project.book_store_be.Response;

import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Model.Address;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNum;
    private Address address;
    private Role role;
}
