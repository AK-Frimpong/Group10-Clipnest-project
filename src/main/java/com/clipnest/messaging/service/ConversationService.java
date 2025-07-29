package com.clipnest.messaging.service;

import com.clipnest.messaging.dto.ConversationDto;
import com.clipnest.messaging.dto.UserDto;
import com.clipnest.messaging.entity.Conversation;
import com.clipnest.messaging.entity.User;
import com.clipnest.messaging.exception.BadRequestException;
import com.clipnest.messaging.exception.ResourceNotFoundException;
import com.clipnest.messaging.repository.ConversationRepository;
import com.clipnest.messaging.repository.UserRepository;
import com.clipnest.messaging.security.UserPrincipal;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    public ConversationDto createConversation(String name, String description, List<Long> participantIds) {
        User currentUser = getCurrentUserEntity();
        
        Conversation conversation = new Conversation(name, currentUser);
        conversation.setDescription(description);
        
        // Add participants
        for (Long participantId : participantIds) {
            User participant = userRepository.findById(participantId)
                    .orElseThrow(() -> new ResourceNotFoundException("Participant not found: " + participantId));
            conversation.addParticipant(participant);
        }
        
        Conversation savedConversation = conversationRepository.save(conversation);
        return convertToDto(savedConversation);
    }

    public Page<ConversationDto> getUserConversations(Pageable pageable) {
        User currentUser = getCurrentUserEntity();
        Page<Conversation> conversations = conversationRepository.findByParticipant(currentUser, pageable);
        return conversations.map(this::convertToDto);
    }

    public ConversationDto getConversation(Long conversationId) {
        User currentUser = getCurrentUserEntity();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.isParticipant(currentUser)) {
            throw new BadRequestException("Not a participant in this conversation");
        }

        return convertToDto(conversation);
    }

    public ConversationDto addParticipant(Long conversationId, Long userId) {
        User currentUser = getCurrentUserEntity();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.isAdmin(currentUser)) {
            throw new BadRequestException("Only admins can add participants");
        }

        User newParticipant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (conversation.isParticipant(newParticipant)) {
            throw new BadRequestException("User is already a participant");
        }

        conversation.addParticipant(newParticipant);
        Conversation savedConversation = conversationRepository.save(conversation);
        
        return convertToDto(savedConversation);
    }

    public ConversationDto removeParticipant(Long conversationId, Long userId) {
        User currentUser = getCurrentUserEntity();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.isAdmin(currentUser)) {
            throw new BadRequestException("Only admins can remove participants");
        }

        User participant = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!conversation.isParticipant(participant)) {
            throw new BadRequestException("User is not a participant");
        }

        if (conversation.getCreatedBy().equals(participant)) {
            throw new BadRequestException("Cannot remove conversation creator");
        }

        conversation.removeParticipant(participant);
        Conversation savedConversation = conversationRepository.save(conversation);
        
        return convertToDto(savedConversation);
    }

    public ConversationDto makeAdmin(Long conversationId, Long userId) {
        User currentUser = getCurrentUserEntity();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.isAdmin(currentUser)) {
            throw new BadRequestException("Only admins can make other users admin");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!conversation.isParticipant(user)) {
            throw new BadRequestException("User is not a participant");
        }

        conversation.addAdmin(user);
        Conversation savedConversation = conversationRepository.save(conversation);
        
        return convertToDto(savedConversation);
    }

    public void leaveConversation(Long conversationId) {
        User currentUser = getCurrentUserEntity();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.isParticipant(currentUser)) {
            throw new BadRequestException("Not a participant in this conversation");
        }

        if (conversation.getCreatedBy().equals(currentUser)) {
            throw new BadRequestException("Creator cannot leave conversation. Transfer ownership first.");
        }

        conversation.removeParticipant(currentUser);
        conversationRepository.save(conversation);
    }

    private User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findByUsername(userPrincipal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private ConversationDto convertToDto(Conversation conversation) {
        ConversationDto dto = modelMapper.map(conversation, ConversationDto.class);
        
        // Convert participants to DTOs
        List<UserDto> participantDtos = conversation.getParticipants().stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
        dto.setParticipants(participantDtos);
        
        // Convert admins to DTOs
        List<UserDto> adminDtos = conversation.getAdmins().stream()
                .map(user -> modelMapper.map(user, UserDto.class))
                .toList();
        dto.setAdmins(adminDtos);
        
        return dto;
    }
}