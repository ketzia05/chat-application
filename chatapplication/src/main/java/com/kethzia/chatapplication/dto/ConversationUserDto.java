package com.kethzia.chatapplication.dto;

public class ConversationUserDto {

    private String email;

    public ConversationUserDto(String email) {
        this.email=email;
    }

    public String getEmail() {
        return email;
    }
}