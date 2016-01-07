package org.openui5;

public class ApplicationConfig {
	private String application;
	private String ftpServer;
	private String ftpPath;
	
	public ApplicationConfig(String application, String ftpServer, String ftpPath) {
		this.application = application;
		this.ftpServer = ftpServer;
		this.ftpPath = ftpPath;
	}
	
	public String getApplication() {
		return application;
	}
	
	public String getFtpServer() {
		return ftpServer;
	}

	public String getFtpPath() {
		return ftpPath;
	}

	public String getFtpUrl() {
		return "ftp://" + ftpServer + ftpPath;
	}
}
