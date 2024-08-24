package com.project.book_store_be.Model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String publisher; //toi tuong co 1 table cho thg pushlishêrr này
    private Date publication_date;
    private Integer number_of_pages;
    private Float price;
    @JoinColumn(name = "id_category")
    @ManyToOne
    private Category category;
    @JoinColumn(name = "id_author")
    @ManyToOne
    private Author author;
    @JoinColumn(name = "id_image")
    @ManyToOne
    private Image image;
}
