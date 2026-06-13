package com.kethzia.chatapplication.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
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
	
	public List<Message> getInbox(String email) {

	    User user = userRepository.findByEmail(email);

	    if(user == null) {
	        throw new RuntimeException("User not found");
	    }

	    List<Message> messages = messageRepository.findByReceiverId(user.getUserId());

	    messages.sort(Comparator.comparing(Message::getSentTime).reversed());

	    return messages;
	}
	
	public void deleteMessage(Integer messageId) {

	    if(!messageRepository.existsById(messageId)) {
	        throw new RuntimeException("Message not found");
	    }

	    messageRepository.deleteById(messageId);
	}
	
	public Message updateMessage(Integer messageId, String content) {
		if(!messageRepository.existsById(messageId)) {
			throw new RuntimeException("Message not found");
		}
		
		Message message = messageRepository.findByMessageId(messageId);
		
		message.setContent(content);
		message.setSentTime(LocalDateTime.now());
		
		return messageRepository.save(message);
	}
	
	public List<Message> viewConversation(ConversationDto dto){

	    User sender =
	            userRepository.findByEmail(
	                    dto.getSenderEmail());

	    User receiver =
	            userRepository.findByEmail(
	                    dto.getReceiverEmail());

	    if(sender==null || receiver==null){
	        throw new RuntimeException(
	                "User not found");
	    }

	    List<Message> messages =
	    		messageRepository
	    		.findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentTimeAsc(
	    		        sender.getUserId(),
	    		        receiver.getUserId(),
	    		        receiver.getUserId(),
	    		        sender.getUserId()
	    		);

	    		for(Message m : messages){

	    		    User s =
	    		    userRepository.findById(
	    		            m.getSenderId()
	    		    ).orElse(null);

	    		    User r =
	    		    userRepository.findById(
	    		            m.getReceiverId()
	    		    ).orElse(null);

	    		    if(s!=null){
	    		        m.setSenderEmail(
	    		                s.getEmail()
	    		        );
	    		    }

	    		    if(r!=null){
	    		        m.setReceiverEmail(
	    		                r.getEmail()
	    		        );
	    		    }
	    		}

	    		return messages;
		}
	
	public List<String> getConversationUsers(String email){

	    User currentUser = userRepository.findByEmail(email);

	    if(currentUser == null){
	        throw new RuntimeException("User not found");
	    }
	    
	    List<Message> messages = messageRepository.findBySenderIdOrReceiverId(
	                            currentUser.getUserId(),
	                            currentUser.getUserId());

	    messages.sort(Comparator.comparing(Message::getSentTime).reversed());

	    LinkedHashSet<String> users = new LinkedHashSet<>();

	    for(Message msg:messages){

	        Integer id = msg.getSenderId().equals(currentUser.getUserId()) ? msg.getReceiverId() : msg.getSenderId();

	        User u= userRepository.findById(id).orElse(null);

	        if(u!=null){
	        	users.add(u.getEmail());
	        }
	    }

	    return new ArrayList<>(
	            users
	    );
	}
}
