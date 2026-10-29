package com.aibi.assistant;

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
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(90));
        this.restTemplate = new RestTemplate(factory);
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> ask(@RequestBody Map<String, String> request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/assistant/ask",
                    entity,
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("AI service returned {} for assistant query: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Cannot connect to AI service for assistant query", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during assistant query proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncData() {
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/assistant/sync",
                    null,
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("AI service returned {} for data sync: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Cannot connect to AI service for data sync", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during data sync proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiServiceBaseUrl + "/api/assistant/status",
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("AI service returned {} for assistant status: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Cannot connect to AI service for assistant status", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during assistant status proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }
}
