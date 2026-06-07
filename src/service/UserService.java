package service;

import java.util.*;

import entity.User;

public class UserService {
	
	static Scanner sc = new Scanner(System.in);
	
	private static List<User> users = new ArrayList<>();
	
	private static int i = 1;
	
	public void register() {
		System.out.print("Enter your name...");
		String name = sc.nextLine();
		System.out.print("Enter your email...");
		String email = sc.nextLine();
		System.out.print("Enter your password...");
		String password = sc.nextLine();
		if(isEmailThere(email) != null) {
			System.out.println("Email already registered...");
		}
		else {
			users.add(new User(i++, name, email, password));
			System.out.println("Registration successful...");
		}
	}
	
	public User login() {
		System.out.print("Enter your email...");
		String email = sc.nextLine();
		System.out.print("Enter your password...");
		String password = sc.nextLine();
		
		User user = isEmailThere(email);

		if(user != null && user.getPassword().equals(password)) {
		    return user;
		}
		
		return null;
	}
	
	public static User isEmailThere(String email) {
		for(User u : users) {
			if(u.getEmail().equals(email)) {
				return u;
			}
		}
		return null;
	}
	
	public User findUserById(int id) {
		for(User u : users) {
			if(u.getUserId() == id) {
				return u;
			}
		}
		return null;
	}
}
