package service;

import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import entity.Message;
import entity.User;
import java.time.LocalDateTime;

public class MessageService {
	private static List<Message> messages = new ArrayList<>();
	
	private static int messageIdCounter = 1;
	
	static Scanner sc = new Scanner(System.in);
	
	public void sendMessage(User currentUser) {
		System.out.print("Enter receiver mail: ");
		String receiverMail = sc.nextLine();
		User receiver = UserService.isEmailThere(receiverMail);
		if(receiver == null) {
			System.out.println("User not exists");
			return;
		}
		else {
			System.out.print("Enter message: ");
			String message = sc.nextLine();
			messages.add(new Message(messageIdCounter++, currentUser.getUserId(), receiver.getUserId(), message, LocalDateTime.now()));
			System.out.println("Message Sent...");
		}
	}

	public void viewConversation(User currentUser) {

	    System.out.print("Enter receiver email: ");
	    String receiverMail = sc.nextLine();

	    User receiver = UserService.isEmailThere(receiverMail);

	    if(receiver == null) {
	        System.out.println("User not found...");
	        return;
	    }

	    System.out.println("\n===== CONVERSATION =====");

	    boolean found = false;

	    for(Message msg : messages) {

	        boolean currentToReceiver =
	                msg.getSenderId() == currentUser.getUserId()
	                && msg.getReceiverId() == receiver.getUserId();

	        boolean receiverToCurrent =
	                msg.getSenderId() == receiver.getUserId()
	                && msg.getReceiverId() == currentUser.getUserId();

	        if(currentToReceiver || receiverToCurrent) {

	            found = true;

	            if(msg.getSenderId() == currentUser.getUserId()) {
	                System.out.println("You : " + msg.getContent());
	            }
	            else {
	                System.out.println(receiver.getUserName() + " : " + msg.getContent());
	            }
	        }
	    }

	    if(!found) {
	        System.out.println("No messages found.");
	    }
	}
}
