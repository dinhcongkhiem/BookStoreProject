package com.project.book_store_be.Request;

import com.project.book_store_be.Model.Address;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRequest {
    private String fullName;
    private String phoneNum;
    private Address address;
}
