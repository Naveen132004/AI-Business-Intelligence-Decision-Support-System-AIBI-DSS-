package com.aibi.healthscore;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxy controller that forwards health score requests to the Python AI service.
 */
@RestController
@RequestMapping("/api/health-score")
@Slf4j
public class HealthScoreProxyController {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public HealthScoreProxyController(
            @Value("${aibi.ai-service.url:http://localhost:8000}") String aiServiceBaseUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateHealthScore() {
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/health-score/calculate",
                    null,
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for health score calculation", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestHealthScore() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiServiceBaseUrl + "/api/health-score/latest",
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for health score retrieval", e);
            if (e.getMessage() != null && e.getMessage().contains("404")) {
                return ResponseEntity.ok(Map.of(
                        "empty", true,
                        "message", "No health score available. Calculate one first."));
            }
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }
}
