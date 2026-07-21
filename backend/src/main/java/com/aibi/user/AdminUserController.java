package com.aibi.user;

import com.aibi.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserProfileResponse> changeRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + roleStr + ". Must be ADMIN or EMPLOYEE");
        }

        return ResponseEntity.ok(userService.changeUserRole(id, role));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserProfileResponse> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("'active' field is required (true/false)");
        }
        return ResponseEntity.ok(userService.changeUserStatus(id, active));
    }
}
