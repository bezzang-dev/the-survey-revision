package com.thesurvey.api.repository;

import com.thesurvey.api.domain.UserCertification;
import com.thesurvey.api.domain.UserCertificationId;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCertificationRepository extends JpaRepository<UserCertification, UserCertificationId> {

    @Query(value = "SELECT certification_type FROM user_certification WHERE user_id = :userId", nativeQuery = true)
    List<Integer> findUserCertificationTypeByUserId(@Param("userId") Long userId);

    @Query("SELECT uc FROM UserCertification uc WHERE uc.userCertificationId.user.userId = :userId")
    List<UserCertification> findUserCertificationByUserId(@Param("userId") Long userId);

    void deleteByExpirationDateLessThanEqual(LocalDateTime nowDate);

}
