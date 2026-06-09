package com.kethzia.chatapplication.dto;

public class SendMessageDto {

    private String senderEmail;
    private String receiverEmail;
    private String content;
	
    public SendMessageDto(String senderEmail, String receiverEmail, String content) {
		this.senderEmail = senderEmail;
		this.receiverEmail = receiverEmail;
		this.content = content;
	}

	public String getSenderEmail() {
		return senderEmail;
	}

	public void setSenderEmail(String senderEmail) {
		this.senderEmail = senderEmail;
	}

	public String getReceiverEmail() {
		return receiverEmail;
	}

	public void setReceiverEmail(String receiverEmail) {
		this.receiverEmail = receiverEmail;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
    
}
