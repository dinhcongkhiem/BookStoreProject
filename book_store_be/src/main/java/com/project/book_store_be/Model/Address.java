package com.project.book_store_be.Model;


import com.project.book_store_be.Embeddable.Commune;
import com.project.book_store_be.Embeddable.District;
import com.project.book_store_be.Embeddable.Province;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
@Entity
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String addressDetail;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "province_value")),
            @AttributeOverride(name = "label", column = @Column(name = "province_label"))
    })
    private Province provinces;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "district_value")),
            @AttributeOverride(name = "label", column = @Column(name = "district_label"))
    })
    private District districts;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "value", column = @Column(name = "commune_value")),
            @AttributeOverride(name = "label", column = @Column(name = "commune_label"))
    })
    private Commune communes;
}