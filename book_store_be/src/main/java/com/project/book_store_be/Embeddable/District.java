package com.project.book_store_be.Embeddable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class District {
    @Column(name = "district_value")
    private String value;

    @Column(name = "district_label")
    private String label;
}
