package com.clipnest.messaging.dto;

import java.time.LocalDateTime;

public class MessageDto {
    
    private Long id;
    private UserDto sender;
    private UserDto recipient;
    private String content;
    private String status;
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Long conversationId;
    private MessageDto replyTo;
    
    // Constructors
    public MessageDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public UserDto getSender() { return sender; }
    public void setSender(UserDto sender) { this.sender = sender; }
    
    public UserDto getRecipient() { return recipient; }
    public void setRecipient(UserDto recipient) { this.recipient = recipient; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    
    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }
    
    public MessageDto getReplyTo() { return replyTo; }
    public void setReplyTo(MessageDto replyTo) { this.replyTo = replyTo; }
    
    // Helper methods
    public boolean isRead() {
        return readAt != null;
    }
}