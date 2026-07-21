package com.aibi.auth.dto;

import com.aibi.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Long userId;
    private String fullName;
    private String email;
    private Role role;
}
