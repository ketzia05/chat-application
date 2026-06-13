package com.kethzia.chatapplication.dto;

public class UpdateMessageDto {

	Integer messageId;
	String content;
	
	public UpdateMessageDto(Integer messageId, String content) {
		this.messageId = messageId;
		this.content = content;
	}

	public UpdateMessageDto() {
		
	}
	
	public Integer getMessageId() {
		return messageId;
	}

	public void setMessageId(Integer messageId) {
		this.messageId = messageId;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
	
}
