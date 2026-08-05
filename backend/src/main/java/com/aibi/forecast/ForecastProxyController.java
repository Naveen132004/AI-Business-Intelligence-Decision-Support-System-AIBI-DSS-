package com.aibi.forecast;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxy controller that forwards forecast requests to the Python AI service.
 * This allows the frontend to only communicate with the Spring Boot backend.
 */
@RestController
@RequestMapping("/api/forecast")
@Slf4j
public class ForecastProxyController {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public ForecastProxyController(
            @Value("${aibi.ai-service.url:http://localhost:8000}") String aiServiceBaseUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    @PostMapping("/train")
    public ResponseEntity<?> trainForecast() {
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/forecast/train",
                    null,
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for forecast training", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestForecast() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiServiceBaseUrl + "/api/forecast/latest",
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for forecast retrieval", e);
            // If it's a 404 from AI service, return empty state
            if (e.getMessage() != null && e.getMessage().contains("404")) {
                return ResponseEntity.ok(Map.of(
                        "empty", true,
                        "message", "No forecast available. Train a model first."));
            }
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }
}
