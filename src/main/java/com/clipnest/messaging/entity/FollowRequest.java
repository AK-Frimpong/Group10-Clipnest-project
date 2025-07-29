package com.clipnest.messaging.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "follow_requests", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"requester_id", "requestee_id"}))
@EntityListeners(AuditingEntityListener.class)
public class FollowRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private User requester;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requestee_id")
    private User requestee;
    
    @Enumerated(EnumType.STRING)
    private RequestStatus status = RequestStatus.PENDING;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime respondedAt;
    
    // Constructors
    public FollowRequest() {}
    
    public FollowRequest(User requester, User requestee) {
        this.requester = requester;
        this.requestee = requestee;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getRequester() { return requester; }
    public void setRequester(User requester) { this.requester = requester; }
    
    public User getRequestee() { return requestee; }
    public void setRequestee(User requestee) { this.requestee = requestee; }
    
    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getRespondedAt() { return respondedAt; }
    public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    
    // Helper methods
    public void accept() {
        this.status = RequestStatus.ACCEPTED;
        this.respondedAt = LocalDateTime.now();
    }
    
    public void reject() {
        this.status = RequestStatus.REJECTED;
        this.respondedAt = LocalDateTime.now();
    }
    
    public boolean isPending() {
        return status == RequestStatus.PENDING;
    }
}

enum RequestStatus {
    PENDING, ACCEPTED, REJECTED
}