package com.clipnest.messaging.controller;

import com.clipnest.messaging.dto.MessageDto;
import com.clipnest.messaging.dto.SendMessageRequest;
import com.clipnest.messaging.entity.User;
import com.clipnest.messaging.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
@Tag(name = "Messaging", description = "Messaging APIs")
@SecurityRequirement(name = "bearerAuth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping
    @Operation(summary = "Send message", description = "Send a message to another user")
    public ResponseEntity<MessageDto> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        MessageDto message = messageService.sendMessage(request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/conversation/{userId}")
    @Operation(summary = "Get conversation", description = "Get conversation with another user")
    public ResponseEntity<Page<MessageDto>> getConversation(
            @PathVariable Long userId,
            Pageable pageable) {
        Page<MessageDto> messages = messageService.getConversation(userId, pageable);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/conversations/{conversationId}")
    @Operation(summary = "Get conversation messages", description = "Get messages from a group conversation")
    public ResponseEntity<Page<MessageDto>> getConversationMessages(
            @PathVariable Long conversationId,
            Pageable pageable) {
        Page<MessageDto> messages = messageService.getConversationMessages(conversationId, pageable);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{messageId}/read")
    @Operation(summary = "Mark message as read", description = "Mark a message as read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long messageId) {
        messageService.markMessageAsRead(messageId);
        return ResponseEntity.ok(Map.of("message", "Message marked as read"));
    }

    @PostMapping("/conversation/{userId}/read")
    @Operation(summary = "Mark conversation as read", description = "Mark all messages in conversation as read")
    public ResponseEntity<?> markConversationAsRead(@PathVariable Long userId) {
        messageService.markConversationAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "Conversation marked as read"));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Get count of unread messages")
    public ResponseEntity<Map<String, Long>> getUnreadMessageCount() {
        long count = messageService.getUnreadMessageCount();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @GetMapping("/recent-conversations")
    @Operation(summary = "Get recent conversations", description = "Get list of recent conversation partners")
    public ResponseEntity<List<User>> getRecentConversations(Pageable pageable) {
        List<User> users = messageService.getRecentConversations(pageable);
        return ResponseEntity.ok(users);
    }
}

@Controller
class WebSocketMessageController {

    @Autowired
    private MessageService messageService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public MessageDto sendMessage(@Payload SendMessageRequest request) {
        return messageService.sendMessage(request);
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public Map<String, String> addUser(@Payload Map<String, String> chatMessage,
                                       SimpMessageHeaderAccessor headerAccessor) {
        // Add username in web socket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.get("sender"));
        return chatMessage;
    }
}