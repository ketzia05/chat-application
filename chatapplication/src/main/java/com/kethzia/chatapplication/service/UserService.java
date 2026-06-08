package com.kethzia.chatapplication.service;

import org.springframework.stereotype.Service;

import com.kethzia.chatapplication.entity.User;
import com.kethzia.chatapplication.repository.UserRepository;

@Service
public class UserService {

	private UserRepository userRepository;

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}
	
	public User register(User user) {
		User existingUser =
	            userRepository.findByEmail(user.getEmail());

	    if(existingUser != null) {
	        throw new RuntimeException("Email already exists");
	    }

	    return userRepository.save(user);
	}
	
	public User login(String email, String password) {
		User existingUser = userRepository.findByEmail(email);
		if(existingUser != null && existingUser.getPassword().equals(password)) {
			return existingUser;
		}
		return null;
	}
}
