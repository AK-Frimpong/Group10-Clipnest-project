package com.clipnest.messaging.service;

import com.clipnest.messaging.dto.MessageDto;
import com.clipnest.messaging.dto.SendMessageRequest;
import com.clipnest.messaging.entity.Conversation;
import com.clipnest.messaging.entity.Message;
import com.clipnest.messaging.entity.User;
import com.clipnest.messaging.exception.BadRequestException;
import com.clipnest.messaging.exception.ResourceNotFoundException;
import com.clipnest.messaging.repository.ConversationRepository;
import com.clipnest.messaging.repository.MessageRepository;
import com.clipnest.messaging.repository.UserRepository;
import com.clipnest.messaging.security.UserPrincipal;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public MessageDto sendMessage(SendMessageRequest request) {
        User sender = getCurrentUserEntity();
        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(request.getContent());

        // Handle conversation (for group messages)
        if (request.getConversationId() != null) {
            Conversation conversation = conversationRepository.findById(request.getConversationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
            
            if (!conversation.isParticipant(sender)) {
                throw new BadRequestException("Not a participant in this conversation");
            }
            
            message.setConversation(conversation);
        }

        // Handle reply
        if (request.getReplyToId() != null) {
            Message replyToMessage = messageRepository.findById(request.getReplyToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Reply message not found"));
            message.setReplyTo(replyToMessage);
        }

        Message savedMessage = messageRepository.save(message);
        MessageDto messageDto = convertToDto(savedMessage);

        // Send real-time notification
        messagingTemplate.convertAndSendToUser(
                recipient.getUsername(),
                "/queue/messages",
                messageDto
        );

        return messageDto;
    }

    public Page<MessageDto> getConversation(Long userId, Pageable pageable) {
        User currentUser = getCurrentUserEntity();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Message> messages = messageRepository.findConversationBetweenUsers(
                currentUser, otherUser, pageable);

        return messages.map(this::convertToDto);
    }

    public Page<MessageDto> getConversationMessages(Long conversationId, Pageable pageable) {
        User currentUser = getCurrentUserEntity();
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        if (!conversation.isParticipant(currentUser)) {
            throw new BadRequestException("Not a participant in this conversation");
        }

        Page<Message> messages = messageRepository.findByConversationId(conversationId, pageable);
        return messages.map(this::convertToDto);
    }

    public void markMessageAsRead(Long messageId) {
        User currentUser = getCurrentUserEntity();
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getRecipient().equals(currentUser)) {
            throw new BadRequestException("Not authorized to mark this message as read");
        }

        if (!message.isRead()) {
            message.markAsRead();
            messageRepository.save(message);

            // Notify sender about read status
            MessageDto messageDto = convertToDto(message);
            messagingTemplate.convertAndSendToUser(
                    message.getSender().getUsername(),
                    "/queue/read-receipts",
                    messageDto
            );
        }
    }

    public void markConversationAsRead(Long userId) {
        User currentUser = getCurrentUserEntity();
        User otherUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Message> unreadMessages = messageRepository.findUnreadMessages(currentUser);
        
        for (Message message : unreadMessages) {
            if (message.getSender().equals(otherUser)) {
                message.markAsRead();
                messageRepository.save(message);
            }
        }
    }

    public long getUnreadMessageCount() {
        User currentUser = getCurrentUserEntity();
        return messageRepository.countUnreadMessages(currentUser);
    }

    public List<User> getRecentConversations(Pageable pageable) {
        User currentUser = getCurrentUserEntity();
        return messageRepository.findRecentConversationPartners(currentUser, pageable);
    }

    private User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userRepository.findByUsername(userPrincipal.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));
    }

    private MessageDto convertToDto(Message message) {
        MessageDto dto = modelMapper.map(message, MessageDto.class);
        
        if (message.getConversation() != null) {
            dto.setConversationId(message.getConversation().getId());
        }
        
        if (message.getReplyTo() != null) {
            dto.setReplyTo(convertToDto(message.getReplyTo()));
        }
        
        return dto;
    }
}