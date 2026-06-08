package com.kethzia.chatapplication.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.kethzia.chatapplication.dto.LoginRequestDto;
import com.kethzia.chatapplication.entity.User;
import com.kethzia.chatapplication.service.UserService;

@RestController
public class UserController {
	
	private UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	@PostMapping("/user/register")
	public User registerUser(@RequestBody User user) {
		return userService.register(user);
	}
	
	@PostMapping("/login")
	public User loginUser(@RequestBody LoginRequestDto loginRequest) {
	    return userService.login(
	            loginRequest.getEmail(),
	            loginRequest.getPassword()
	    );
	}
}
