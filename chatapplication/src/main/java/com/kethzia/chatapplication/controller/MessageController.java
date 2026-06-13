package com.kethzia.chatapplication.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kethzia.chatapplication.dto.ConversationDto;
import com.kethzia.chatapplication.dto.SendMessageDto;
import com.kethzia.chatapplication.dto.UpdateMessageDto;
import com.kethzia.chatapplication.entity.Message;
import com.kethzia.chatapplication.service.MessageService;

@RestController
public class MessageController {

	MessageService messageService;
	
	public MessageController(MessageService messageService) {
		this.messageService = messageService;
	}

	@PostMapping("/send")
	public Message sendMessage(@RequestBody SendMessageDto dto) {
	    return messageService.sendMessage(dto);
	}
	
	@PostMapping("/conversation")
	public List<Message> viewConversation(@RequestBody ConversationDto dto) {
	    return messageService.viewConversation(dto);
	}
	
	@GetMapping("/inbox/{email}")
	public List<Message> getInbox(@PathVariable String email){
	    return messageService.getInbox(email);
	}
	
	@DeleteMapping("/message/{id}")
	public String deleteMessage(@PathVariable Integer id) {
	    messageService.deleteMessage(id);
	    return "Message Deleted Successfully";
	}
	
	@GetMapping("/conversations/{email}")
	public List<String> getConversations(@PathVariable String email){
	    return messageService.getConversationUsers(email);
	}
	
	@PutMapping("/update")
	public Message updateMessage(@RequestBody UpdateMessageDto updateMessage) {
		return messageService.updateMessage(updateMessage.getMessageId(), updateMessage.getContent());
	}
}
