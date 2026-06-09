package com.kethzia.chatapplication.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kethzia.chatapplication.entity.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
	List<Message> findBySenderIdAndReceiverId(
            Integer senderId,
            Integer receiverId);
}
