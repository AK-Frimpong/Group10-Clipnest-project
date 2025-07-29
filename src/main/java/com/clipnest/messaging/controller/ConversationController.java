package com.clipnest.messaging.controller;

import com.clipnest.messaging.dto.ConversationDto;
import com.clipnest.messaging.service.ConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/conversations")
@Tag(name = "Conversations", description = "Group conversation management APIs")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping
    @Operation(summary = "Create conversation", description = "Create a new group conversation")
    public ResponseEntity<ConversationDto> createConversation(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String description = (String) request.get("description");
        @SuppressWarnings("unchecked")
        List<Long> participantIds = (List<Long>) request.get("participantIds");
        
        ConversationDto conversation = conversationService.createConversation(name, description, participantIds);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping
    @Operation(summary = "Get user conversations", description = "Get all conversations for current user")
    public ResponseEntity<Page<ConversationDto>> getUserConversations(Pageable pageable) {
        Page<ConversationDto> conversations = conversationService.getUserConversations(pageable);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Get conversation", description = "Get conversation details")
    public ResponseEntity<ConversationDto> getConversation(@PathVariable Long conversationId) {
        ConversationDto conversation = conversationService.getConversation(conversationId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/{conversationId}/participants")
    @Operation(summary = "Add participant", description = "Add a participant to the conversation")
    public ResponseEntity<ConversationDto> addParticipant(
            @PathVariable Long conversationId,
            @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        ConversationDto conversation = conversationService.addParticipant(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/{conversationId}/participants/{userId}")
    @Operation(summary = "Remove participant", description = "Remove a participant from the conversation")
    public ResponseEntity<ConversationDto> removeParticipant(
            @PathVariable Long conversationId,
            @PathVariable Long userId) {
        ConversationDto conversation = conversationService.removeParticipant(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/{conversationId}/admins")
    @Operation(summary = "Make admin", description = "Make a participant an admin")
    public ResponseEntity<ConversationDto> makeAdmin(
            @PathVariable Long conversationId,
            @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        ConversationDto conversation = conversationService.makeAdmin(conversationId, userId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/{conversationId}/leave")
    @Operation(summary = "Leave conversation", description = "Leave the conversation")
    public ResponseEntity<?> leaveConversation(@PathVariable Long conversationId) {
        conversationService.leaveConversation(conversationId);
        return ResponseEntity.ok(Map.of("message", "Left conversation successfully"));
    }
}