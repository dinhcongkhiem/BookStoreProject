package com.project.book_store_be.Model;

import com.project.book_store_be.Enum.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @ManyToOne
    private Publisher publisher;
    private Date publication_date;
    private Integer number_of_pages;
    private BigDecimal original_price;
    private Integer quantity;
    private ProductStatus status;
    @ManyToOne
    private Category category;
    @ManyToOne
    private Author author;

}
