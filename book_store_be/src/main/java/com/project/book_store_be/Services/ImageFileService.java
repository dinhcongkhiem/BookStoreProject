package com.project.book_store_be.Services;

import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ImageRepository;
import com.project.book_store_be.Repository.ProductRepository;
import lombok.Builder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

@Service
@Builder

public class ImageFileService {



    @Autowired
    private ImageRepository repo;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AmazonS3Service service;

    public String uploadFile(MultipartFile file, String fileName,Long productId) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid product ID:" + productId));
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        String fileUrl = service.uploadFile(fileName, file);
        ImageProduct imageProduct = ImageProduct.builder()
                .fileName(fileName)
                .fileUrl(fileUrl)
                .product(product)
                .build();
        repo.save(imageProduct);

        return fileUrl;
    }


    public void deleteImageProduct(Long id){
        if(repo.existsById(id)){
            repo.deleteById(id);
        } else {
            throw new IllegalArgumentException("ImageProduct with ID " + id + "not found");
        }
    }


}
