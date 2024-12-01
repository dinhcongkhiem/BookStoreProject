package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher,Long> {
    List<Publisher> findByNameContainingIgnoreCaseOrderByIdAsc(String name);

    Optional<Publisher> findByNameIgnoreCase(String name);

}
