package com.clipnest.messaging.controller;

import com.clipnest.messaging.dto.UserDto;
import com.clipnest.messaging.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "User management APIs")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Get current authenticated user profile")
    public ResponseEntity<UserDto> getCurrentUser() {
        UserDto user = userService.getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}")
    @Operation(summary = "Get user by username", description = "Get user profile by username")
    public ResponseEntity<UserDto> getUserByUsername(@PathVariable String username) {
        UserDto user = userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile", description = "Update current user profile")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserDto userDto) {
        UserDto updatedUser = userService.updateProfile(userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Change user password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        userService.changePassword(currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @GetMapping("/search")
    @Operation(summary = "Search users", description = "Search users by username or name")
    public ResponseEntity<Page<UserDto>> searchUsers(
            @RequestParam String query,
            Pageable pageable) {
        Page<UserDto> users = userService.searchUsers(query, pageable);
        return ResponseEntity.ok(users);
    }

    @PostMapping("/{username}/follow")
    @Operation(summary = "Follow user", description = "Follow a user or send follow request")
    public ResponseEntity<UserDto> followUser(@PathVariable String username) {
        UserDto user = userService.followUser(username);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{username}/follow")
    @Operation(summary = "Unfollow user", description = "Unfollow a user")
    public ResponseEntity<UserDto> unfollowUser(@PathVariable String username) {
        UserDto user = userService.unfollowUser(username);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{username}/followers")
    @Operation(summary = "Get followers", description = "Get user followers list")
    public ResponseEntity<Page<UserDto>> getFollowers(
            @PathVariable String username,
            Pageable pageable) {
        Page<UserDto> followers = userService.getFollowers(username, pageable);
        return ResponseEntity.ok(followers);
    }

    @GetMapping("/{username}/following")
    @Operation(summary = "Get following", description = "Get user following list")
    public ResponseEntity<Page<UserDto>> getFollowing(
            @PathVariable String username,
            Pageable pageable) {
        Page<UserDto> following = userService.getFollowing(username, pageable);
        return ResponseEntity.ok(following);
    }

    @GetMapping("/follow-requests")
    @Operation(summary = "Get follow requests", description = "Get pending follow requests")
    public ResponseEntity<Page<UserDto>> getFollowRequests(Pageable pageable) {
        Page<UserDto> requests = userService.getFollowRequests(pageable);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/follow-requests/{requestId}/accept")
    @Operation(summary = "Accept follow request", description = "Accept a follow request")
    public ResponseEntity<UserDto> acceptFollowRequest(@PathVariable Long requestId) {
        UserDto user = userService.acceptFollowRequest(requestId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/follow-requests/{requestId}/reject")
    @Operation(summary = "Reject follow request", description = "Reject a follow request")
    public ResponseEntity<?> rejectFollowRequest(@PathVariable Long requestId) {
        userService.rejectFollowRequest(requestId);
        return ResponseEntity.ok(Map.of("message", "Follow request rejected"));
    }
}