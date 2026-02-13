package com.thesurvey.api;

import com.thesurvey.api.domain.UserTest;
import com.thesurvey.api.repository.UserTestRepository;
import com.thesurvey.api.service.UserTestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
public class ConcurrencyTest {

    @Autowired
    private UserTestRepository userTestRepository;

    @Autowired
    private UserTestService userTestService;

    @Test
    public void testConcurrentUpdates() throws Exception {
        // Start from a clean state to keep this test deterministic.
        userTestRepository.deleteAll();

        UserTest userTest = new UserTest();
        userTest.setUsername("test1");
        userTestRepository.save(userTest);
        ExecutorService executor = Executors.newFixedThreadPool(2);

        // ready: both workers are prepared, start: release both at the same time.
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Future<?> thread1 = executor.submit(() -> {
            ready.countDown();
            await(start);
            userTestService.thread1();
        });
        Future<?> thread2 = executor.submit(() -> {
            ready.countDown();
            await(start);
            userTestService.thread2();
        });

        assertTrue(ready.await(5, TimeUnit.SECONDS), "Workers were not ready in time");
        start.countDown();

        // Propagate worker-thread failures to the test thread.
        thread1.get(30, TimeUnit.SECONDS);
        thread2.get(30, TimeUnit.SECONDS);
        executor.shutdown();
        assertTrue(executor.awaitTermination(30, TimeUnit.SECONDS), "Executor did not terminate in time");

        // Verify the expected end state after concurrent execution.
        List<UserTest> users = userTestRepository.findAll();
        assertEquals(2, users.size());
        assertTrue(users.stream().anyMatch(u -> "test1".equals(u.getUsername())));
        assertTrue(users.stream().anyMatch(u -> "test2".equals(u.getUsername())));
    }

    private static void await(CountDownLatch latch) {
        try {
            latch.await();
        } catch (InterruptedException e) {
            // Preserve interruption status and fail fast.
            Thread.currentThread().interrupt();
            throw new IllegalStateException(e);
        }
    }

}
