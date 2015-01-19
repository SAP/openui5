package org.openui5;

public class ApplicationConfig {
	private String application;
	private String account;
	private String[] servers;
	
	public ApplicationConfig(String application, String account, String[] servers) {
		this.application = application;
		this.account = account;
		this.servers = servers;
	}
	
	public String getApplication() {
		return application;
	}

	public String getAccount() {
		return account;
	}

	public String[] getServers() {
		return servers;
	}
}
