package com.clipnest.messaging.repository;

import com.clipnest.messaging.entity.FollowRequest;
import com.clipnest.messaging.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {
    
    Optional<FollowRequest> findByRequesterAndRequestee(User requester, User requestee);
    
    @Query("SELECT fr FROM FollowRequest fr WHERE fr.requestee = :user AND fr.status = 'PENDING' ORDER BY fr.createdAt DESC")
    Page<FollowRequest> findPendingRequestsForUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT fr FROM FollowRequest fr WHERE fr.requester = :user ORDER BY fr.createdAt DESC")
    Page<FollowRequest> findRequestsSentByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT COUNT(fr) FROM FollowRequest fr WHERE fr.requestee = :user AND fr.status = 'PENDING'")
    long countPendingRequestsForUser(@Param("user") User user);
    
    boolean existsByRequesterAndRequestee(User requester, User requestee);
}