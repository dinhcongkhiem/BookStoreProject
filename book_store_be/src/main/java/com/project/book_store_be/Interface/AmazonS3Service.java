package com.project.book_store_be.Interface;

import com.project.book_store_be.Services.AmazonS3ServiceImpl;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
public interface AmazonS3Service {
        void init();
        File convertToJpg(MultipartFile file) throws IOException;
        AmazonS3ServiceImpl.S3ServiceResponse uploadFile(MultipartFile file) throws IOException;

        String hashFileName(String input);
}
