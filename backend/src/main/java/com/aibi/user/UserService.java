package com.aibi.user;

import com.aibi.user.dto.ChangePasswordRequest;
import com.aibi.user.dto.UpdateProfileRequest;
import com.aibi.user.dto.UserProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Profile ──────────────────────────────────────────────

    public UserProfileResponse getProfile(String email) {
        User user = findByEmailOrThrow(email);
        return toProfileResponse(user);
    }

    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmailOrThrow(email);
        user.setFullName(request.getFullName());
        user = userRepository.save(user);
        return toProfileResponse(user);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findByEmailOrThrow(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ── Admin Operations ─────────────────────────────────────

    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    public UserProfileResponse changeUserRole(Long userId, Role newRole) {
        User user = findByIdOrThrow(userId);
        user.setRole(newRole);
        user = userRepository.save(user);
        return toProfileResponse(user);
    }

    public UserProfileResponse changeUserStatus(Long userId, boolean active) {
        User user = findByIdOrThrow(userId);
        user.setIsActive(active);
        user = userRepository.save(user);
        return toProfileResponse(user);
    }

    // ── Helpers ──────────────────────────────────────────────

    private User findByEmailOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private User findByIdOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
