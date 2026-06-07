package main;

import java.util.Scanner;

import entity.User;
import service.MessageService;
import service.UserService;

public class ChatApplication {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner s = new Scanner(System.in);
		
		UserService us = new UserService();
		MessageService ms = new MessageService();
		
		User currentUser = null;
		
		System.out.println("===== CHAT APP =====");
		System.out.println("1. Register");
		System.out.println("2. Login");
		System.out.println("3. Exit");
		
		System.out.print("Enter your choice...");
		int ch = s.nextInt();
		while(ch<3 && ch>0) {
			switch(ch) {
				case 1 -> {
					us.register();
					System.out.println();
				}
				case 2 -> {
					currentUser = us.login();
					if(currentUser!=null) {
						System.out.println("Login Successful");
						boolean flag = true;
						while(flag) {
							System.out.println("===== USER MENU =====\r\n"
									+ "1. Send Message\r\n"
									+ "2. View Conversations\r\n"
									+ "3. Logout");
							System.out.println("Enter your choice");
							int choice = s.nextInt();
							switch(choice) {
								case 1 -> {
									ms.sendMessage(currentUser);
									System.out.println();
								}
								case 2 -> {
									ms.viewConversation(currentUser);
									System.out.println();
								}
								case 3 -> {
									currentUser = null;
									flag = false;
								}
							}
						}
						
					}
					else {
						System.out.println("Login not Successful");
					}
				}
			}
			System.out.println("===== CHAT APP =====");
			System.out.println("1. Register");
			System.out.println("2. Login");
			System.out.println("3. Exit");
			System.out.print("Enter your choice...");
			ch = s.nextInt();
		}
		
		s.close();
	}

}
