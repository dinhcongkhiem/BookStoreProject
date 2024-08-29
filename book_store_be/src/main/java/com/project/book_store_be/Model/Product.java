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
    @ManyToOne
    @JoinColumn(name = "id_publisher")
    private Publisher publisher;
    private Date publication_date;
    private Integer number_of_pages;
    private Float price;
    @JoinColumn(name = "id_category")
    @ManyToOne
    private Category category;
    @JoinColumn(name = "id_author")
    @ManyToOne
    private Author author;


}
