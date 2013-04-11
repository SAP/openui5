package com.sap.ui5.selenium.common;

import java.io.FileInputStream;
import java.util.Properties;

import com.sap.ui5.selenium.util.Constants;

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
	
	/** Get parameter value by key */
	public String getParameter(String key){
	    
	    String value = config.getProperty(key);
	    if (value != null) {
	        
	        return value;
	    }else {
	        
	        throw new RuntimeException("The key " + key + " is not existing in Config.properties!");
	    }
	}
	
	/** Get Image Repository Home */
	public String getImageRepositoryHome(){
		
		return config.getProperty("ImageRepositoryHome");
	}
	
	/** Get OS on tests execution platform */
	public String getOsName(){
		
		return config.getProperty("Driver.OS.Name");
	}
	
	/** Get OS bits: 32 or 64 */
	public String getOsBits(){
		
		return config.getProperty("Driver.OS.Bits");
	}
	
	/** Get target browser Name */
	public String getBrowserName(){
		
		return config.getProperty("Driver.Browser.Name");
	}
	
	/** Get target Browser version */
	public String getBrowserVersion(){
		
		return config.getProperty("Driver.Browser.Version");
	}
	
	/** Get target Browser bits: 32, 64, it is only used on IE */
	public String getBrowserBits(){
		
		return config.getProperty("Driver.Browser.Bits");
	}
	
	/** Get Remote WebDriver URL protocol */
	public String getRemoteProtocol(){
		
		return config.getProperty("Driver.Remote.Protocol");
	}
	
	/** Get Remote WebDriver URL Host */
	public String getRemoteHost(){
		
		return config.getProperty("Driver.Remote.Host");
	}
	
	/** Get Remote WebDriver URL Domain */
	public String getRemoteDomain(){
		
		return config.getProperty("Driver.Remote.Domain");
	}
	
	/** Get Remote WebDriver URL Port */
	public String getRemotePort(){
		
		return config.getProperty("Driver.Remote.Port");
	}
	
	
	/** Get AUT URL protocol */
	public String getUrlProtocol(){
		
		return config.getProperty("URL.Protocol");
	}
	
	/** Get AUT URL Host */
	public String getUrlHost(){
		
		return config.getProperty("URL.Host");
	}
	
	/** Get AUT URL Domain */
	public String getUrlDomain(){
		
		return config.getProperty("URL.Domain");
	}
	
	/** Get AUT URL Port */
	public String getUrlPort(){
		
		return config.getProperty("URL.Port");
	}
	
	
	/** Get AUT URL Path */
	public String getUrlBasePath(){
		
		return config.getProperty("URL.BasePath");
	}
	
	/** Get AUT URL Parameter Theme */
	public String getUrlParameterTheme(){
		
		return config.getProperty("URL.Parameter.sap-ui-theme");
	}
	
	/** Get AUT URL Parameter rtl */
	public String getUrlParameterRtl(){
		
		return config.getProperty("URL.Parameter.sap-ui-rtl");
	}
	
	/** Get AUT URL Parameter Jquery Version */
	public String getUrlParameterJquery(){
		
		return config.getProperty("URL.Parameter.sap-ui-jqueryversion");
	}
	
	/** Get Run Mode */
	public String getRunMode(){
		
		return config.getProperty("Run.Mode");
	}

	/** Get Run Environment */
	public String getRunEnvironment(){
		
		return config.getProperty("Run.Environment");
	}
	
	public int getScreenResolutionWidth(){
	    
	    String s = config.getProperty("Screen.Resolution.Width");
	    return Integer.parseInt(s);
	}
	
	public int getScreenResolutionHeight(){
	        
	    String s = config.getProperty("Screen.Resolution.Height");
	    return Integer.parseInt(s);
	}
	
	public int getScreenColorDepth(){
	    
	    String s = config.getProperty("Screen.ColorDepth");
	    return Integer.parseInt(s);
	}
	
	

}
