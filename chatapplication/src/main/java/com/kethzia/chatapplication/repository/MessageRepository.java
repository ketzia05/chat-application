package com.kethzia.chatapplication.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kethzia.chatapplication.entity.Message;

@Repository
public interface MessageRepository
extends JpaRepository<Message,Integer>{

    List<Message>
    findBySenderIdOrReceiverId(
            Integer senderId,
            Integer receiverId
    );

    List<Message>
    findBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderBySentTimeAsc(
            Integer sender1,
            Integer receiver1,
            Integer sender2,
            Integer receiver2
    );

    List<Message>
    findByReceiverId(
            Integer receiverId
    );

    Message findByMessageId(
            Integer messageId
    );
}