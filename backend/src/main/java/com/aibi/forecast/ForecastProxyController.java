package com.aibi.forecast;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
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
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(120));
        this.restTemplate = new RestTemplate(factory);
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    @PostMapping("/train")
    public ResponseEntity<?> trainForecast() {
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/forecast/train",
                    null,
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            // AI service responded with an error status — forward it as-is
            log.warn("AI service returned {} for forecast training: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            // Actual connection failure — AI service is truly unreachable
            log.error("Cannot connect to AI service for forecast training", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during forecast training proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestForecast() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiServiceBaseUrl + "/api/forecast/latest",
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("AI service returned {} for forecast retrieval: {}", e.getStatusCode(), e.getResponseBodyAsString());
            // If it's a 404 from AI service, return empty state
            if (e.getStatusCode().value() == 404) {
                return ResponseEntity.ok(Map.of(
                        "empty", true,
                        "message", "No forecast available. Train a model first."));
            }
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Cannot connect to AI service for forecast retrieval", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during forecast retrieval proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }
}
