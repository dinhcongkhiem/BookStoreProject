package com.project.book_store_be.Controller;

import com.project.book_store_be.Model.Translator;
import com.project.book_store_be.Services.TranslatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/translator")
public class TranslatorController {
    private final TranslatorService translatorService;

    @GetMapping()
    public List<Translator> getAllTranslators() {
        return translatorService.getAllTranslators();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Translator> getTranslatorById(@PathVariable Long id) {
        Translator translator = translatorService.getTranslatorById(id);
        if (translator == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(translator);
    }

    @PostMapping()
    public Translator createTranslator(@RequestBody Translator translator) {
        return translatorService.createTranslator(translator);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Translator> updateTranslator(@PathVariable Long id, @RequestBody Translator translatorDetails) {
        Translator updatedTranslator = translatorService.updateTranslator(id, translatorDetails);
        if (updatedTranslator == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedTranslator);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTranslator(@PathVariable Long id) {
        translatorService.deleteTranslator(id);
        return ResponseEntity.noContent().build();
    }
}
