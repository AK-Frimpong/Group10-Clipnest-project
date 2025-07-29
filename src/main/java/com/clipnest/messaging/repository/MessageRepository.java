package com.clipnest.messaging.repository;

import com.clipnest.messaging.entity.Message;
import com.clipnest.messaging.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.recipient = :user2) OR " +
           "(m.sender = :user2 AND m.recipient = :user1) " +
           "ORDER BY m.createdAt ASC")
    Page<Message> findConversationBetweenUsers(@Param("user1") User user1, 
                                               @Param("user2") User user2, 
                                               Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId ORDER BY m.createdAt ASC")
    Page<Message> findByConversationId(@Param("conversationId") Long conversationId, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE m.recipient = :user AND m.readAt IS NULL")
    List<Message> findUnreadMessages(@Param("user") User user);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient = :user AND m.readAt IS NULL")
    long countUnreadMessages(@Param("user") User user);
    
    @Query("SELECT DISTINCT CASE " +
           "WHEN m.sender = :user THEN m.recipient " +
           "ELSE m.sender END " +
           "FROM Message m WHERE m.sender = :user OR m.recipient = :user " +
           "ORDER BY MAX(m.createdAt) DESC")
    List<User> findRecentConversationPartners(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT m FROM Message m WHERE " +
           "(m.sender = :user1 AND m.recipient = :user2) OR " +
           "(m.sender = :user2 AND m.recipient = :user1) " +
           "ORDER BY m.createdAt DESC")
    List<Message> findLatestMessageBetweenUsers(@Param("user1") User user1, 
                                                @Param("user2") User user2, 
                                                Pageable pageable);
}