package com.project.book_store_be.Services;

import com.project.book_store_be.Model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class SendMailService {
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${information.nameShop}")
    private String nameShop;
    @Value("${information.emailShop}")
    private String emailShop;
    @Value("${information.ccGmailShop}")
    private String ccGmailShop;

    public void sendEmail(User user, String subject, String template, Map<String, Object> variables){
        try {
            String emailFrom = nameShop + "<"+ emailShop +">";
            Context context = new Context();
            if(variables != null) {
                variables.keySet().forEach(key -> {
                    context.setVariable(key,variables.get(key));
                });
            }

            context.setVariable("user", user);

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            String htmlContent = templateEngine.process(template, context);

            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(user.getEmail());
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            helper.setCc(ccGmailShop);
            log.info("Send email to {}", user.getEmail());
            mailSender.send(mimeMessage);

        }catch(MessagingException e){
            e.printStackTrace();
        }
    }
}
