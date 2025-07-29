package com.clipnest.messaging.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ConversationDto {
    
    private Long id;
    private String name;
    private String description;
    private String type;
    private UserDto createdBy;
    private List<UserDto> participants;
    private List<UserDto> admins;
    private MessageDto lastMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int unreadCount;
    
    // Constructors
    public ConversationDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public UserDto getCreatedBy() { return createdBy; }
    public void setCreatedBy(UserDto createdBy) { this.createdBy = createdBy; }
    
    public List<UserDto> getParticipants() { return participants; }
    public void setParticipants(List<UserDto> participants) { this.participants = participants; }
    
    public List<UserDto> getAdmins() { return admins; }
    public void setAdmins(List<UserDto> admins) { this.admins = admins; }
    
    public MessageDto getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageDto lastMessage) { this.lastMessage = lastMessage; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public int getUnreadCount() { return unreadCount; }
    public void setUnreadCount(int unreadCount) { this.unreadCount = unreadCount; }
}