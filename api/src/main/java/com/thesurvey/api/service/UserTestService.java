package com.thesurvey.api.service;

import com.thesurvey.api.domain.UserTest;
import com.thesurvey.api.repository.UserTestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class UserTestService {

    @Autowired
    private UserTestRepository userTestRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public void thread1() {
        System.out.println("[Thread1] Transaction Start");
        UserTest userTest = userTestRepository.findAllByOrderByIdDesc().get(0);
//        userTest.setUsername("newTest1");
//        userTestRepository.delete(userTest);
//        System.out.println("[Thread1] Delete userTest = " + userTest.getUsername());
        UserTest newUserTest = new UserTest();
        newUserTest.setUsername("test2");
        userTestRepository.save(newUserTest);
        System.out.println("[Thread1] Save New UserTest = " + newUserTest.getUsername());
//        UserTest insertedUserTest = userTestRepository.findAllByOrderByIdDesc().get(0);
//        System.out.println("[Thread1] InsertedUserTest Id = " + insertedUserTest.getId() + " username = " + insertedUserTest.getUsername());

        System.out.println("[Thread1] Transaction End");
    }

    @Transactional
    public void thread2() {
        System.out.println("[Thread2] Transaction Start");
//        List<UserTest> userTests = userTestRepository.findAllByOrderByIdDesc();
//        for (UserTest userTest : userTests) {
////            System.out.println("[Thread2] First fetches = " + userTest.getUsername());
//        }
        UserTest userTest = userTestRepository.findAllByOrderByIdDesc().get(0);
        System.out.println("[Thread2] UserTest Id = " + userTest.getId() + " username = " + userTest.getUsername());

        System.out.println("[Thread2] Transaction End");
    }

    @Transactional
    public void thread3() {
        System.out.println("[Thread3] Transaction Start");
        UserTest userTest = userTestRepository.findAllByOrderByIdDesc().get(0);
        System.out.println("[Thread3] UserTest Id = " + userTest.getId() + " username = " + userTest.getUsername());

        System.out.println("[Thread3] Transaction End");
    }

}
