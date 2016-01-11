package org.openui5;

public class ApplicationConfig {
	private String application;
	private String logUrl;
	
	public ApplicationConfig(String application, String logUrl) {
		this.application = application;
		this.logUrl = logUrl;
	}
	
	public String getApplication() {
		return application;
	}
	
	public String getLogUrl() {
		return logUrl;
	}
}
