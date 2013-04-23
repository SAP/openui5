package com.sap.ui5.selenium.common;

import java.awt.Dimension;
import java.awt.DisplayMode;
import java.awt.GraphicsEnvironment;
import java.awt.Toolkit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.openqa.selenium.Platform;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.Utility;


public enum InitService {
	
	INSTANCE;
	
	private Config config = Config.INSTANCE;
	
	private String fileSeparator;

	private String osDIR;
	private String browserDIR;
	private String themeDIR;
	private String rtlDIR;
	
	//Supported OS
	private List<String> osList = new ArrayList<String>();
	{
		osList.add("WindowsXP_32");
		osList.add("Windows2008_64");
		osList.add("Windows7_64");
	}
	//Supported Browsers
	private List<String> browserList = new ArrayList<String>();
	{
		browserList.add("Firefox");
		browserList.add("Chrome");
		browserList.add("IE8_32");
		browserList.add("IE8_64");
		browserList.add("IE9_32");
		browserList.add("IE9_64");
	}


	private InitService(){

		initialize();
	}
	
	
	/** Initialization commander */
	private void initialize(){
		fileSeparator = System.getProperty("file.separator");
		
		if(!verifyConfigIsOK()){
			System.out.println("Config file has a fatal error, Please check!");
			System.exit(1);
		}
		
		if (!verifyEnvironment()){
	          System.out.println("Test environment is not valid, Please check!");
	          System.exit(1);
		}
		
		if (!initializeParameters()){
			System.out.println("It is failed to Initialize test parameters from config file, Please check!");
			System.exit(1);
		}
		
		//Print Test Runtime Initialization Info
		System.out.println("####    Test Runtime Initialization    ####");
		System.out.println("##OS=" + System.getProperty("os.name"));
		System.out.println("##Architecture=" + System.getProperty("os.arch"));
		System.out.println("##Screen Resolution=" + config.getScreenResolutionWidth()
		                   + "*" + config.getScreenResolutionHeight());
		System.out.println("##Browser=" + config.getBrowserName());
		System.out.println("##Java Version=" + System.getProperty("java.version"));
		System.out.println("##Test target=" + getBaseURL());
		System.out.println("##Image Base Path=" + getImagesBasePath());
		System.out.println();
		System.out.println("####    Test Starting    ####");
	}
	
	/** Get base URL for all tests */
	public String getBaseURL(){
		
		String baseURL;
		
		//http://veui5infra.dhcp.wdf.sap.corp:8080/uilib-sample
		baseURL = config.getUrlProtocol() + ":" + "//" + config.getUrlHost() + "." + config.getUrlDomain() + ":" + config.getUrlPort() + config.getUrlBasePath();
		
		return baseURL;
	}
	
	
	/** Get directories for expected images */
	private boolean initializeParameters(){

		//Get OS from config
		String OS = config.getOsName() + "_" + config.getOsBits();
		if (!Utility.isValueInCollection(OS, osList)){
			
			System.out.println("OS in config is not correct!");
			return false;
		}
		osDIR = OS;
		
		
		//Get Browser from config
		String browser;
		if (config.getBrowserName().equalsIgnoreCase("IE")) {
			
			browser = config.getBrowserName() + config.getBrowserVersion() 
					  + "_" + config.getBrowserBits();
		} else {
			
			browser = config.getBrowserName();
		}
		
		if (!Utility.isValueInCollection(browser, browserList)) {
			
			System.out.println("Browser in config is not correct!");
			return false;
		}
		browserDIR = browser;
		

		//Get SAPUI5 Theme from config
		String themeGoldrefection = "sap_goldreflection";
		String themeHcb = "sap_hcb";
		
		String themeGoldrefectionDIR = "goldrefection";
		String themeHcbDIR = "hcb";
		
		List<String> theme = new ArrayList<String>(); 
		theme.add(themeGoldrefection);
		theme.add(themeHcb);
		
		if (!Utility.isValueInCollection(config.getUrlParameterTheme(), theme)){
			
			System.out.println("SAPUI5 Theme information is not correctly in config property file.");
			return false;
		}
		
		if (config.getUrlParameterTheme().equalsIgnoreCase(themeGoldrefection)){	
			themeDIR = themeGoldrefectionDIR;
		}
		
		if (config.getUrlParameterTheme().equalsIgnoreCase(themeHcb)){
			themeDIR = themeHcbDIR;
		}
		
		
		//Get SAPUI5 rtl from config
		String rtlFalse = "false";
		String rtlTrue = "true";
		
		String rtlFalseDIR = "Rtl_false";
		String rtlTrueDIR = "Rtl_true";
		
		List<String> rtl = new ArrayList<String>();
		rtl.add(rtlFalse);
		rtl.add(rtlTrue);
		
		if (!Utility.isValueInCollection(config.getUrlParameterRtl(), rtl)){
			
			System.out.println("SAPUI5 RTL information is not correctly in config property file.");
			return false;
		}
		
		if (config.getUrlParameterRtl().equalsIgnoreCase(rtlFalse)){
			rtlDIR = rtlFalseDIR;
		}
		
		if (config.getUrlParameterRtl().equalsIgnoreCase(rtlTrue)){
			rtlDIR = rtlTrueDIR;
		}
		
		return true;
		
	}
	
	/** Verify test environment as expected */
	private boolean verifyEnvironment(){

	    //Check screen resolution
	    Dimension targetDimension = new Dimension(config.getScreenResolutionWidth(), 
	                                              config.getScreenResolutionHeight()); 
	    Dimension realDimension = Toolkit.getDefaultToolkit().getScreenSize();
	    if (!targetDimension.equals(realDimension)) {
	        
	        System.out.println("The Screen resolution is not matched with configuration!");
	        System.out.println("The target screen resolution:" + targetDimension.width 
	                           + "*" + targetDimension.height);
	        System.out.println("The real screen resolution:" + realDimension.width 
                               + "*" + realDimension.height);
	        return false;
	    }
	    
	    //Check screen color depth
	    DisplayMode displayMode = GraphicsEnvironment.getLocalGraphicsEnvironment()
	                              .getDefaultScreenDevice().getDisplayMode();
	    
	    int targetColorDepth = config.getScreenColorDepth();
	    int realColorDepth = displayMode.getBitDepth();
	    
	    if (!(targetColorDepth == realColorDepth)) {
	        
	        System.out.println("The Screen color depth is not matched with configuration!");
	        System.out.println("The target screen color depth: " + targetColorDepth);
	        System.out.println("The real screen color depth: " + realColorDepth);
	        
	        return false;
	    }
	    
	    return true;
	}
	
	/** Get Image Base Path based on the config file setting */
	public String getImagesBasePath(){
		
		String imageBasePath = config.getImageRepositoryHome() + fileSeparator + osDIR + fileSeparator +
				               browserDIR + fileSeparator + themeDIR + fileSeparator +
				               rtlDIR;
		return imageBasePath;
		
	}
	
	/** Verify the configure properties */
	private boolean verifyConfigIsOK(){
		
		//Check Protocol
		List<String> protocol = new ArrayList<String>();
		protocol.add("http");
		protocol.add("https");
		
		if (!Utility.isValueInCollection(config.getUrlProtocol(), protocol)){
			
			System.out.println("AUT URL Protocol in config is not correct!");
			return false;
		}
		
		
		//Check Run.Mode
		List<String> runMode = new ArrayList<String>();
		runMode.add("DEV");
		runMode.add("TEST");
		
		if (!Utility.isValueInCollection(config.getRunMode(), runMode)){
			
			System.out.println("Run Mode in config is not correct!");
			return false;
		}
		
		//Check Run.Environment
		List<String> runEnv = new ArrayList<String>();
		runEnv.add("Local");
		runEnv.add("Remote");
		
		if (!Utility.isValueInCollection(config.getRunEnvironment(), runEnv)){
			
			System.out.println("Run Environment in config is not correct!");
			return false;
		}
		
		//Add more check points here based on the need
		
		
		return true;
	}
	
	/** Get Browser type by returning int number, 1 is Firefox, 2 is IE, 3 is Chrome, 0 is error */
	public int getBrowserType(){
		
		
		if (config.getBrowserName().equalsIgnoreCase("Firefox")){
			return Constants.FIREFOX;
		}
		
		if (config.getBrowserName().equalsIgnoreCase("IE")){
			return Constants.IE;
		}
		
		if (config.getBrowserName().equalsIgnoreCase("Chrome")){
			return Constants.CHROME;
		}
		
		return 0;
	}
	
	public String getFileSeparator() {
		return fileSeparator;
	}
	
	/** Return true if tests run as DEV mode */
	public boolean isDevMode(){
		
		if (config.getRunMode().equalsIgnoreCase("DEV")){
			return true;
		}
		
		return false;
	}
	
	/** Return true if tests run on Remote Environment */
	public boolean isRemoteEnv(){
		
		if (config.getRunEnvironment().equalsIgnoreCase("Remote")){
			return true;
		}
		
		return false;
	}
	
	/** Get Remote WebDriver Server URL */
	public String getRemoteSeleniumServerURL(){
		
		String remoteUrl;
		String remotePath = "/wd/hub";
		
		//http://veui5infra.dhcp.wdf.sap.corp:4444/wd/hub
		remoteUrl = config.getRemoteProtocol() + ":" + "//" + config.getRemoteHost()
				    + "." + config.getRemoteDomain() + ":" + config.getRemotePort()
				    + remotePath;
		
		return remoteUrl;	
	}
	
	/** Get target platform for Grid */
	public Platform getTargetPlatform(){
		
		if (Utility.isValueInCollection(config.getOsName(), Arrays.asList(Constants.PLATFORM_WIN_XP))){
			
			return Platform.XP;
		}
		
		if (Utility.isValueInCollection(config.getOsName(), Arrays.asList(Constants.PLATFORM_WIN_VISTA))){
			
			return Platform.VISTA;
		}
		
		if (Utility.isValueInCollection(config.getOsName(), Arrays.asList(Constants.PLATFORM_WIN8))){
			
			return Platform.WIN8;
		}
		
		System.out.println("No platform is matched by OS in config.properties");
		return null;
	}
}
