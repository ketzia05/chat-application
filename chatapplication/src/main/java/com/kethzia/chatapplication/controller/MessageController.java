package com.kethzia.chatapplication.controller;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kethzia.chatapplication.dto.ConversationDto;
import com.kethzia.chatapplication.dto.SendMessageDto;
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
}
