package com.thesurvey.api;

import com.thesurvey.api.domain.UserTest;
import com.thesurvey.api.repository.UserTestRepository;
import com.thesurvey.api.service.UserTestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@SpringBootTest
@ActiveProfiles("test")
public class ConcurrencyTest {

    @Autowired
    private UserTestRepository userTestRepository;

    @Autowired
    private UserTestService userTestService;

    @Test
    public void testConcurrentUpdates() throws InterruptedException {
        UserTest userTest = new UserTest();
        userTest.setUsername("test1");
        userTestRepository.save(userTest);
        ExecutorService executor = Executors.newFixedThreadPool(3);

        executor.submit(() -> userTestService.thread1());
//        executor.submit(() -> userTestService.thread2());

        executor.shutdown();
        executor.awaitTermination(1, TimeUnit.MINUTES);
    }

}
