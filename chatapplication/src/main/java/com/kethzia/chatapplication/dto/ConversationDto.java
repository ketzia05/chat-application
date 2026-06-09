package com.kethzia.chatapplication.dto;

public class ConversationDto {

    private String senderEmail;
    private String receiverEmail;

    public ConversationDto() {
    	
    }
    
    public ConversationDto(String senderEmail, String receiverEmail) {
		this.senderEmail = senderEmail;
		this.receiverEmail = receiverEmail;
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
}