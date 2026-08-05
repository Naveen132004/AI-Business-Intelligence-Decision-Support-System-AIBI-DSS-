package com.aibi.assistant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Proxy controller that forwards RAG Business Assistant requests to the Python AI service.
 */
@RestController
@RequestMapping("/api/assistant")
@Slf4j
public class AssistantProxyController {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public AssistantProxyController(
            @Value("${aibi.ai-service.url:http://localhost:8000}") String aiServiceBaseUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String, String> request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/assistant/ask",
                    entity,
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for assistant query", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncData() {
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/assistant/sync",
                    null,
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for data sync", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    aiServiceBaseUrl + "/api/assistant/status",
                    Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            log.error("Failed to reach AI service for assistant status", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        }
    }
}
