package com.thesurvey.api.repository;

import com.thesurvey.api.domain.User;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserIdForUpdate(@Param("userId") Long userId);

    @Query("SELECT u FROM User u JOIN fetch u.answeredQuestions a")
    List<User> findAllByAnsweredQuestion();

    @Query("SELECT u.point FROM User u WHERE u.userId = :userId")
    Integer findPointByUserId(@Param("userId") Long userId);

}
