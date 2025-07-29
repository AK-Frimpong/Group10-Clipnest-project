package com.clipnest.messaging.repository;

import com.clipnest.messaging.entity.Conversation;
import com.clipnest.messaging.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    @Query("SELECT c FROM Conversation c JOIN c.participants p WHERE p = :user ORDER BY c.updatedAt DESC")
    Page<Conversation> findByParticipant(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT c FROM Conversation c WHERE c.createdBy = :user ORDER BY c.createdAt DESC")
    Page<Conversation> findByCreatedBy(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Conversation c JOIN c.participants p WHERE c.id = :conversationId AND p.id = :userId")
    boolean isParticipant(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
    
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Conversation c JOIN c.admins a WHERE c.id = :conversationId AND a.id = :userId")
    boolean isAdmin(@Param("conversationId") Long conversationId, @Param("userId") Long userId);
}