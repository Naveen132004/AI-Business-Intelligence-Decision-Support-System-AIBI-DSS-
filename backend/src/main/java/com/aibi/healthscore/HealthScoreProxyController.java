package com.aibi.healthscore;

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
 * Proxy controller that forwards health score requests to the Python AI service.
 */
@RestController
@RequestMapping("/api/health-score")
@Slf4j
public class HealthScoreProxyController {

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;

    public HealthScoreProxyController(
            @Value("${aibi.ai-service.url:http://localhost:8000}") String aiServiceBaseUrl,
            @Value("${aibi.ai-service.internal-key:}") String internalKey) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(60));
        this.restTemplate = new RestTemplate(factory);
        if (!internalKey.isBlank()) {
            // Shared secret checked by the AI service when it has a public URL
            this.restTemplate.getInterceptors().add((request, body, execution) -> {
                request.getHeaders().set("X-Internal-Key", internalKey);
                return execution.execute(request, body);
            });
        }
        this.aiServiceBaseUrl = aiServiceBaseUrl;
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateHealthScore() {
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    aiServiceBaseUrl + "/api/health-score/calculate",
                    null,
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("AI service returned {} for health score calculation: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Cannot connect to AI service for health score calculation", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during health score calculation proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatestHealthScore() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiServiceBaseUrl + "/api/health-score/latest",
                    String.class);
            return ResponseEntity.status(response.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpStatusCodeException e) {
            log.warn("AI service returned {} for health score retrieval: {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 404) {
                return ResponseEntity.ok(Map.of(
                        "empty", true,
                        "message", "No health score available. Calculate one first."));
            }
            return ResponseEntity.status(e.getStatusCode())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(e.getResponseBodyAsString());
        } catch (ResourceAccessException e) {
            log.error("Cannot connect to AI service for health score retrieval", e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("error", "AI service unavailable. Please ensure the AI service is running.",
                                 "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error during health score retrieval proxy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error", "detail", e.getMessage()));
        }
    }
}
