package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Author;
import com.project.book_store_be.Model.Publisher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author,Long> {
    Optional<Author> findByNameIgnoreCase(String name);

    List<Author> findByNameContainingIgnoreCaseOrderByIdAsc(String name);

}
