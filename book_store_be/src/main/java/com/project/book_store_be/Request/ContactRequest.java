package com.project.book_store_be.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContactRequest {
    @NotNull(message = "Tên không được để trống.")
    private String name;

    @NotNull(message = "Tiêu đề không được để trống.")
    private String title;

    @NotNull(message = "Nội dung không được để trống.")
    private String content;

    @NotNull(message = "Email không được để trống.")
    @Email(message = "Email không hợp lệ.")
    private String email;

}
