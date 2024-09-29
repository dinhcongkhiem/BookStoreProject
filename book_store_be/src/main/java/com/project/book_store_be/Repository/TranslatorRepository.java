package com.project.book_store_be.Repository;

import com.project.book_store_be.Model.Translator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TranslatorRepository extends JpaRepository<Translator,Long> {
    Optional<Translator> findByName(String name);
}
