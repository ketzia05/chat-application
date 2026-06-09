package com.kethzia.chatapplication.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.kethzia.chatapplication.dto.ConversationDto;
import com.kethzia.chatapplication.dto.SendMessageDto;
import com.kethzia.chatapplication.entity.Message;
import com.kethzia.chatapplication.entity.User;
import com.kethzia.chatapplication.repository.MessageRepository;
import com.kethzia.chatapplication.repository.UserRepository;

@Service
public class MessageService {

	MessageRepository messageRepository;
	UserRepository userRepository;
	
	public MessageService(MessageRepository messageRepository, UserRepository userRepository) {
		this.messageRepository = messageRepository;
		this.userRepository = userRepository;
	}

	public Message sendMessage(SendMessageDto dto) {

	    Message message = new Message();
	    
	    User sender = userRepository.findByEmail(dto.getSenderEmail());
	    User receiver = userRepository.findByEmail(dto.getReceiverEmail());

	    System.out.println(sender);
	    System.out.println(receiver);
	    
	    if(sender == null || receiver == null) {
	        throw new RuntimeException("User not found");
	    }
	    
	    message.setSenderId(sender.getUserId());
	    message.setReceiverId(receiver.getUserId());
	    message.setContent(dto.getContent());

	    message.setSentTime(LocalDateTime.now());

	    return messageRepository.save(message);
	}
	
	public List<Message> viewConversation(ConversationDto dto) {

	    User sender = userRepository.findByEmail(dto.getSenderEmail());

	    User receiver = userRepository.findByEmail(dto.getReceiverEmail());

	    if(sender == null || receiver == null) {
	        throw new RuntimeException("User not found");
	    }

	    return messageRepository.findBySenderIdAndReceiverId(sender.getUserId(), receiver.getUserId());
	}
	
}
