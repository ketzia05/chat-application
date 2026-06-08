package com.kethzia.chatapplication.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kethzia.chatapplication.entity.User;

public interface UserRepository extends JpaRepository<User,Integer> {

	User findByEmail(String email);
	
}
