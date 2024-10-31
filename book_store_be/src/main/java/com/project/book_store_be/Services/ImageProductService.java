package com.project.book_store_be.Services;

import com.project.book_store_be.Model.ImageProduct;
import com.project.book_store_be.Model.Product;
import com.project.book_store_be.Repository.ImageRepository;
import com.project.book_store_be.Repository.ProductRepository;
import com.project.book_store_be.Response.ImageProductResponse;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
@Builder
public class ImageProductService {
    @Autowired
    private ImageRepository repo;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private AmazonS3ServiceImpl service;

    public String uploadImage(MultipartFile images) {
        try {
            return service.uploadFile(images).getUrlImg();
        } catch (IOException e) {
            return null;
        }
    }

    public void uploadMultipleImageProduct(List<MultipartFile> images, Long productId, Integer indexThumbnail, List<Long> imagesId) {
        try {
            if (images != null && images.size() > 0) {
                for (int i = 0; i < images.size(); i++) {
                    MultipartFile image = images.get(i);
                    this.uploadFileAsync(image,
                            productId,
                            indexThumbnail == i,
                            imagesId.size() - 1 < i ? null : imagesId.get(i)).get();
                }

            }
        } catch (IOException | ExecutionException | InterruptedException e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Async
    public CompletableFuture<String> uploadFileAsync(MultipartFile file, Long productId, Boolean isThumbnail, Long imageId) throws IOException {
        String fileUrl = InsertProductImage(file, productId, isThumbnail, imageId);
        return CompletableFuture.completedFuture(fileUrl);
    }

    public String InsertProductImage(MultipartFile file, Long productId, Boolean isThumbnail, Long imageId) throws IOException {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NoSuchElementException("Invalid product ID:" + productId));
        if (file.isEmpty() && imageId == null) {
            throw new IllegalArgumentException("File must not be empty");
        }

        String fileUrl = "";
        if (imageId != null) {
            ImageProduct imageProduct = repo.findById(imageId).orElseThrow(() -> new NoSuchElementException("Khong co Anh nao id la " + imageId));
            imageProduct.setIsThumbnail(isThumbnail);
            repo.save(imageProduct);
            fileUrl = imageProduct.getUrlImage();
            return fileUrl;

        } else {
            AmazonS3ServiceImpl.S3ServiceResponse s3ServiceResponse = service.uploadFile(file);
            String fileName = s3ServiceResponse.getFileName();
            fileUrl = s3ServiceResponse.getUrlImg();
            ImageProduct imageProduct = ImageProduct.builder()
                    .id(imageId)
                    .nameImage(fileName)
                    .urlImage(fileUrl)
                    .product(product)
                    .isThumbnail(isThumbnail)
                    .build();
            repo.save(imageProduct);
            return fileUrl;
        }
    }

    public void updateOldImg(List<Long> listOldImg, Long productId) {
        List<ImageProduct> currentImages = repo.findByProductIdOrderByIsThumbnailDesc(productId);
        List<ImageProduct> imagesToDelete = currentImages.stream()
                .filter(image -> !listOldImg.contains(image.getId()))
                .toList();
        repo.deleteAllById(imagesToDelete.stream().map(ImageProduct::getId).toList());
        service.deleteFiles(imagesToDelete);

    }

    public List<ImageProductResponse> getImagesProductId(Long productId) {
        return repo.findByProductIdOrderByIsThumbnailDesc(productId).stream().map(this::convertToResponse).toList();
    }

    public String getThumbnailProduct(Long productId) {
        Optional<ImageProduct> optional = repo.findThumbnailByProductId(productId);
        return optional.map(ImageProduct::getUrlImage).orElse(null);
    }

    private ImageProductResponse convertToResponse(ImageProduct imageProduct) {
        return ImageProductResponse.builder()
                .id(imageProduct.getId())
                .urlImage(imageProduct.getUrlImage())
                .nameImage(imageProduct.getNameImage())
                .isThumbnail(imageProduct.getIsThumbnail())
                .build();
    }


}
