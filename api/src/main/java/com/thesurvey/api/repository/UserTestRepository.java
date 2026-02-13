package com.thesurvey.api.repository;

import com.thesurvey.api.domain.UserTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;

@Repository
public interface UserTestRepository extends JpaRepository<UserTest, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<UserTest> findAllByOrderByIdDesc();

}
