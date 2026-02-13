package com.thesurvey.api.repository;

import com.thesurvey.api.domain.PointHistory;
import com.thesurvey.api.domain.PointHistoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointHistoryRepository extends JpaRepository<PointHistory, PointHistoryId> {

}
