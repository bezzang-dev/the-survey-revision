package com.thesurvey.api.util;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

public class CustomObjectMapper {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static <T> T deserialize(byte[] data, Class<T> clazz) throws IOException {
        return objectMapper.readValue(data, clazz);
    }

    public static byte[] serialize(Object object) throws IOException {
        return objectMapper.writeValueAsBytes(object);
    }
}
