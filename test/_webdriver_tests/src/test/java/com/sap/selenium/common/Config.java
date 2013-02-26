package com.sap.selenium.common;

import java.io.FileInputStream;
import java.util.Properties;

import com.sap.selenium.util.Constants;

public enum Config {

	INSTANCE;

	private Properties config;	
	public boolean isInitializedOK;
	public final String configFilePath = Constants.USER_HOME + Constants.FILE_SEPARATOR + "Automation" + Constants.FILE_SEPARATOR + 
			                              "Test-Parameters" + Constants.FILE_SEPARATOR + "Config.properties";

	
	private Config(){
		try {
			
			FileInputStream in = new FileInputStream(configFilePath);
			config = new Properties();
			config.load(in);
			
			isInitializedOK = true;
		}catch (Exception e){
			
			e.printStackTrace();	
			isInitializedOK = false;
			
			System.out.println("Environment is set failed. please check!");
			System.exit(1);
		}

	}
	
	/** Get Image Repository Home */
	public String getImageRepositoryHome(){
		
		return config.getProperty("ImageRepositoryHome");
	}
	
	/** Get OS on tests execution platform */
	public String getOS(){
		
		return config.getProperty("Driver.OS");
	}
	
	/** Get Browser Name on tests execution platform */
	public String getBrowserName(){
		
		return config.getProperty("Driver.Browser");
	}
	
	/** Get URL protocol */
	public String getUrlProtocol(){
		
		return config.getProperty("URL.Protocol");
	}
	
	/** Get URL Host */
	public String getUrlHost(){
		
		return config.getProperty("URL.Host");
	}
	
	/** Get URL Domain */
	public String getUrlDomain(){
		
		return config.getProperty("URL.Domain");
	}
	
	/** Get URL Port */
	public String getUrlPort(){
		
		return config.getProperty("URL.Port");
	}
	
	
	/** Get URL Path */
	public String getUrlBasePath(){
		
		return config.getProperty("URL.BasePath");
	}
	
	/** Get URL Parameter Theme */
	public String getUrlParameterTheme(){
		
		return config.getProperty("URL.Parameter.sap-ui-theme");
	}
	
	/** Get URL Parameter rtl */
	public String getUrlParameterRtl(){
		
		return config.getProperty("URL.Parameter.sap-ui-rtl");
	}
	
	/** Get URL Parameter Jquery Version */
	public String getUrlParameterJquery(){
		
		return config.getProperty("URL.Parameter.sap-ui-jqueryversion");
	}
	
	/** Get Run Mode */
	public String getRunMode(){
		
		return config.getProperty("Run.Mode");
	}

}
