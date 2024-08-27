package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Image;
import com.project.book_store_be.Repository.ImageRepository;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@Builder

public class ImageFileService {



    @Autowired
    private ImageRepository repo;

    @Autowired
    private AmazonS3Service service;

    public String uploadFile(MultipartFile file) throws IOException {
        String fileUrl = service.uploadFile(file.getOriginalFilename(), file);
        Image image = new Image();
        image.setFileName(file.getOriginalFilename());
        image.setFileUrl(fileUrl);
        repo.save(image);

        return fileUrl;
    }
}
