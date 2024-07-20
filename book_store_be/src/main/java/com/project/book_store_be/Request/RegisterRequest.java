package com.project.book_store_be.Request;

import com.project.book_store_be.Enum.Role;
import com.project.book_store_be.Model.Address;
import lombok.Data;

@Data
public class RegisterRequest {
    private String email;
    private String fullName;
    private String password;
    private String phoneNum;
    private Address address;
    private Role role;

}
