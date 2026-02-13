package com.thesurvey.api.util;

import com.thesurvey.api.domain.User;
import com.thesurvey.api.exception.ErrorMessage;
import com.thesurvey.api.exception.mapper.NotFoundExceptionMapper;
import com.thesurvey.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserUtil {

    private final UserRepository userRepository;

    public User getUserFromAuthentication(Authentication authentication) {
        String name = authentication.getName();
        return userRepository.findByName(name)
                .orElseThrow(() -> new NotFoundExceptionMapper(ErrorMessage.USER_NAME_NOT_FOUND, name));
    }

    public Long getUserIdFromAuthentication(Authentication authentication) {
        return getUserFromAuthentication(authentication).getUserId();
    }
}
