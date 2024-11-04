package com.project.book_store_be.Model;

import com.project.book_store_be.Enum.CoverType;
import com.project.book_store_be.Enum.ProductStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

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
    @Column(length = 4)
    private Integer year_of_publication;
    private Integer number_of_pages;
    private Integer quantity;
    private ProductStatus status;
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Integer> size;
    private Integer weight;
    private String translatorName;
    private CoverType coverType;
    @Column(columnDefinition = "TEXT")
    private String description;
    private BigDecimal cost;
    private BigDecimal original_price;
    private BigDecimal price;
    private String manufacturer;
    @ManyToOne
    private Publisher publisher;
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Category> categories;

    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Author> authors;
    @ManyToOne
    private Discount discount;
    private Date createDate;
    private Date updateDate;


}
