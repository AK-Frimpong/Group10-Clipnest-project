package com.clipnest.messaging.service;

import com.clipnest.messaging.dto.UserDto;
import com.clipnest.messaging.entity.FollowRequest;
import com.clipnest.messaging.entity.User;
import com.clipnest.messaging.exception.BadRequestException;
import com.clipnest.messaging.exception.ResourceNotFoundException;
import com.clipnest.messaging.repository.FollowRequestRepository;
import com.clipnest.messaging.repository.UserRepository;
import com.clipnest.messaging.security.UserPrincipal;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FollowRequestRepository followRequestRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDto getCurrentUser() {
        User user = getCurrentUserEntity();
        return convertToDto(user, user);
    }

    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        User currentUser = getCurrentUserEntity();
        return convertToDto(user, currentUser);
    }

    public UserDto updateProfile(UserDto userDto) {
        User currentUser = getCurrentUserEntity();
        
        if (userDto.getUsername() != null && !userDto.getUsername().equals(currentUser.getUsername())) {
            if (userRepository.existsByUsername(userDto.getUsername())) {
                throw new BadRequestException("Username is already taken");
            }
            currentUser.setUsername(userDto.getUsername());
        }
        
        if (userDto.getEmail() != null && !userDto.getEmail().equals(currentUser.getEmail())) {
            if (userRepository.existsByEmail(userDto.getEmail())) {
                throw new BadRequestException("Email is already in use");
            }
            currentUser.setEmail(userDto.getEmail());
        }
        
        if (userDto.getFirstName() != null) {
            currentUser.setFirstName(userDto.getFirstName());
        }
        
        if (userDto.getLastName() != null) {
            currentUser.setLastName(userDto.getLastName());
        }
        
        if (userDto.getBio() != null) {
            currentUser.setBio(userDto.getBio());
        }
        
        if (userDto.getProfilePictureUrl() != null) {
            currentUser.setProfilePictureUrl(userDto.getProfilePictureUrl());
        }
        
        currentUser.setPrivate(userDto.isPrivate());
        
        User savedUser = userRepository.save(currentUser);
        return convertToDto(savedUser, savedUser);
    }

    public void changePassword(String currentPassword, String newPassword) {
        User user = getCurrentUserEntity();
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Page<UserDto> searchUsers(String query, Pageable pageable) {
        User currentUser = getCurrentUserEntity();
        Page<User> users = userRepository.searchUsers(query, pageable);
        return users.map(user -> convertToDto(user, currentUser));
    }

    public UserDto followUser(String username) {
        User currentUser = getCurrentUserEntity();
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (currentUser.equals(targetUser)) {
            throw new BadRequestException("Cannot follow yourself");
        }

        if (currentUser.getFollowing().contains(targetUser)) {
            throw new BadRequestException("Already following this user");
        }

        if (targetUser.isPrivate()) {
            // Create follow request for private accounts
            if (followRequestRepository.existsByRequesterAndRequestee(currentUser, targetUser)) {
                throw new BadRequestException("Follow request already sent");
            }
            
            FollowRequest followRequest = new FollowRequest(currentUser, targetUser);
            followRequestRepository.save(followRequest);
            
            return convertToDto(targetUser, currentUser);
        } else {
            // Direct follow for public accounts
            currentUser.getFollowing().add(targetUser);
            targetUser.getFollowers().add(currentUser);
            
            userRepository.save(currentUser);
            userRepository.save(targetUser);
            
            return convertToDto(targetUser, currentUser);
        }
    }

    public UserDto unfollowUser(String username) {
        User currentUser = getCurrentUserEntity();
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (!currentUser.getFollowing().contains(targetUser)) {
            throw new BadRequestException("Not following this user");
        }

        currentUser.getFollowing().remove(targetUser);
        targetUser.getFollowers().remove(currentUser);

        userRepository.save(currentUser);
        userRepository.save(targetUser);

        return convertToDto(targetUser, currentUser);
    }

    public Page<UserDto> getFollowers(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        User currentUser = getCurrentUserEntity();
        
        // Convert Set to Page manually or use a different approach
        return userRepository.findUsersByIds(
            user.getFollowers().stream().map(User::getId).toList(), 
            pageable
        ).map(follower -> convertToDto(follower, currentUser));
    }

    public Page<UserDto> getFollowing(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        
        User currentUser = getCurrentUserEntity();
        
        return userRepository.findUsersByIds(
            user.getFollowing().stream().map(User::getId).toList(), 
            pageable
        ).map(following -> convertToDto(following, currentUser));
    }

    public Page<UserDto> getFollowRequests(Pageable pageable) {
        User currentUser = getCurrentUserEntity();
        Page<FollowRequest> requests = followRequestRepository.findPendingRequestsForUser(currentUser, pageable);
        return requests.map(request -> convertToDto(request.getRequester(), currentUser));
    }

    public UserDto acceptFollowRequest(Long requestId) {
        User currentUser = getCurrentUserEntity();
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));

        if (!request.getRequestee().equals(currentUser)) {
            throw new BadRequestException("Not authorized to accept this request");
        }

        if (!request.isPending()) {
            throw new BadRequestException("Request is not pending");
        }

        // Accept the request
        request.accept();
        followRequestRepository.save(request);

        // Add to followers/following
        User requester = request.getRequester();
        requester.getFollowing().add(currentUser);
        currentUser.getFollowers().add(requester);

        userRepository.save(requester);
        userRepository.save(currentUser);

        return convertToDto(requester, currentUser);
    }

    public void rejectFollowRequest(Long requestId) {
        User currentUser = getCurrentUserEntity();
        FollowRequest request = followRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow request not found"));

        if (!request.getRequestee().equals(currentUser)) {
            throw new BadRequestException("Not authorized to reject this request");
        }

        if (!request.isPending()) {
            throw new BadRequestException("Request is not pending");
        }

        request.reject();
        followRequestRepository.save(request);
    }

    private User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findByUsername(userPrincipal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private UserDto convertToDto(User user, User currentUser) {
        UserDto dto = modelMapper.map(user, UserDto.class);
        dto.setFollowerCount(user.getFollowerCount());
        dto.setFollowingCount(user.getFollowingCount());
        
        if (currentUser != null && !currentUser.equals(user)) {
            dto.setFollowing(currentUser.getFollowing().contains(user));
            dto.setFollowedBy(user.getFollowing().contains(currentUser));
            dto.setHasRequestedFollow(
                followRequestRepository.existsByRequesterAndRequestee(currentUser, user)
            );
        }
        
        return dto;
    }
}