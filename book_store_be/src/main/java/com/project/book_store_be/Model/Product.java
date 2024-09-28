package com.project.book_store_be.Model;

import com.project.book_store_be.Enum.CoverType;
import com.project.book_store_be.Enum.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

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
    private Date publication_date;
    private Integer number_of_pages;
    private Integer quantity;
    private ProductStatus status;
    private String size;
    @ManyToOne
    private Translator translator;
    private CoverType coverType;
    @Column(columnDefinition = "TEXT")
    private String description;
    private BigDecimal cost;
    private BigDecimal original_price;
    @ManyToOne
    private Publisher publisher;
    @ManyToMany
    private List<Category> categories;
    @ManyToMany
    private List<Author> authors;


}
