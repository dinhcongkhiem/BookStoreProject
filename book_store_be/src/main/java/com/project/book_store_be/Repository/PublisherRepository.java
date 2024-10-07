package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher,Long> {
    List<Publisher> findByNameContainingIgnoreCase(String name);
}
