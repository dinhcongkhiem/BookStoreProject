package com.project.book_store_be.Services;

import com.project.book_store_be.Model.Translator;
import com.project.book_store_be.Repository.TranslatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TranslatorService {
    private final TranslatorRepository translatorRepository;
    public List<Translator> getAllTranslators() {
        return translatorRepository.findAll();
    }

    public Translator getTranslatorById(Long id) {
        return translatorRepository.findById(id).orElse(null);
    }

    public Translator createTranslator(Translator translator) {
        if (translatorRepository.findByName(translator.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên dịch giả đã tồn tại");
        }
        return translatorRepository.save(translator);
    }

    public Translator updateTranslator(Long id, Translator translatorDetails) {
        Translator translator = translatorRepository.findById(id).orElse(null);
        if (translator != null) {
            if (translator.getName().equals(translatorDetails.getName())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên dịch giả mới phải khác với tên cũ");
            }
            if (translatorRepository.findByName(translatorDetails.getName()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tên dịch giả đã tồn tại");
            }
            translator.setName(translatorDetails.getName());
            return translatorRepository.save(translator);
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch giả");
    }

    public void deleteTranslator(Long id) {
        if (!translatorRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy dịch giả");
        }
        translatorRepository.deleteById(id);
    }
}
