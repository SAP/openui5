package com.sap.selenium.common;


import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.io.File;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import com.sap.selenium.action.IUserAction;
import com.sap.selenium.action.UserActionChrome;
import com.sap.selenium.action.UserActionFirefox;
import com.sap.selenium.action.UserActionIE;
import com.sap.selenium.util.Constants;
import com.sap.selenium.util.Utility;




public class TestBase extends CommonBase{
	
	private final Config config = Config.INSTANCE;
	private final InitService service = InitService.INSTANCE;
	
	protected IUserAction userAction;
	
	private String baseUrl = service.getBaseURL();  //"http://veui5infra.dhcp.wdf.sap.corp:8080/uilib-sample";
	
	//Image repository for the current test runtime 
	private final String imagesBasePath = service.getImagesbasePath();
	
	//Image directory for each test class
	private final String testDIR = getTestDIR();
	
	//For expected images
	private final String expectedImagesDIR = testDIR + fileSeparator + "ExpectedImages" + fileSeparator; 
	
	//The images for manual check
	private final String needVerifyImagesDIR = testDIR + fileSeparator + "NeedVerifyImages" + fileSeparator;  
	
	//Temporary Image DIR. It should be empty before testing.
	private final String tempImagesDIR = testDIR + fileSeparator + "TempImages" + fileSeparator;
	
	//differ image DIR. It should be empty before testing
	private final String diffImagesDIR = testDIR + fileSeparator + "DiffImages" + fileSeparator;
	
	//Prefix and Suffix for Image file 
	private final String expectedImagePrefix = this.getClass().getSimpleName() + "-";
	private final String diffImagePrefix = this.getClass().getSimpleName() + "-diff-";
	private final String expectedImageSuffix = "." + Constants.IMAGE_TYPE;
	private final String diffImageSuffix =  "." + Constants.IMAGE_TYPE;
	
	public TestBase(){
		
		initialize();
	}
	
	/** Common initialization for all tests */
	private void initialize(){
		
		//Check if 4 base directories is OK
		createDIR(expectedImagesDIR);
		createDIR(needVerifyImagesDIR);
		createDIR(tempImagesDIR);
		createDIR(diffImagesDIR);
		
		//Clean files before testing
		deleteAllFilesInDirectory(new File(tempImagesDIR));
		deleteAllFilesInDirectory(new File(diffImagesDIR));
		
		//initial WebDriver
		getDriver();
		
	}
	
	/** Create target directory by full path*/
	private void createDIR(String Path){
		
		File targetDIR = new File(Path);
		
		if(!targetDIR.exists()){
			targetDIR.mkdirs();
		}
	}
	
	/** Delete all files in a directory */
	private boolean deleteAllFilesInDirectory(File directory){
		
		if (!directory.isDirectory()){
			return false;
		}
		
		boolean isSuccess = true;
		File[] files = directory.listFiles();
	
		for (int i = 0; i < files.length; i++){
			
			isSuccess = isSuccess && files[i].delete();
		}
		
		return isSuccess;
	}
	
	/** Get testDIR path with starting ".tests." sub-package */
	private String getTestDIR(){
		String startPakage = ".tests.";
		String fullName = this.getClass().getName();
		
		int index = fullName.lastIndexOf(startPakage) + startPakage.length();
		
		fullName = fullName.substring(index);
		
		return imagesBasePath + fileSeparator + fullName.replace(".", fileSeparator);
	}

	/** Get browser type, it definition is in Constants.Class */
	public int getBrowserType(){
		return service.getBrowserType();
	}
	
	/** Initial WebDriver and return the instance */
	private WebDriver getDriver(){
		
		//Get target driver
		switch (getBrowserType()){
		case Constants.FIREFOX:
			if(!initializeFirefoxDriver()){
				if (driver != null){
					driver.quit();
					driver = null;
					System.out.println("Failed to initialize FireFoxDriver!");
				}
				
			}
			break;

		case Constants.IE:
			if(!initializeIEDriver()){
				if (driver != null){
					driver.quit();
					driver = null;
					System.out.println("Failed to initialize IEDriver!");
				}
			}
			break;
			
		case Constants.CHROME:
			if(!initializeChromeDriver()){
				if (driver != null){
					driver.quit();
					driver = null;
					System.out.println("Failed to initialize ChromeDriver!");
				}
			}
			break;
			
		default:
		case 0:
			System.out.println("Failed to get driver, as the config file is wrong");
			System.exit(1);
		}
		
		return driver;
	}
	
	/** Initialize Fiefox Driver */
	private boolean initializeFirefoxDriver(){
		
		try {
			
			driver = new FirefoxDriver();
			
			driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
			driver.manage().window().maximize();
			
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}

		
		// Click the two buttons "Ctrl" and "/" at the same time on the keyboard.
		// To cancel the status bar of browser
		Robot robot;
		try {
			robot = new Robot();
			robot.delay(1000);
			robot.keyPress(KeyEvent.VK_CONTROL);
			robot.keyPress(KeyEvent.VK_SLASH);
			robot.keyRelease(KeyEvent.VK_CONTROL);
			robot.keyRelease(KeyEvent.VK_SLASH);
		} catch (AWTException e) {
			e.printStackTrace();
			System.out.println("Failed to initialize Firefox Driver! ");
			return false;
		}
		
		try {
			//Initialize UserAction for Firefox
			userAction = new UserActionFirefox();
			userAction.setRtl(isRtlTrue());
			
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}

		return true;
	}
	
	/** Initialize IE Driver */
	private boolean initializeIEDriver(){
		
		try{
			
			driver = new InternetExplorerDriver();
			driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
			driver.manage().window().maximize();
			
			//Initialize UserAction for IE
			userAction = new UserActionIE();
			userAction.setRtl(isRtlTrue());
			
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}

		return true;
	}
	
	/** Initialize Chrome Driver */
	private boolean initializeChromeDriver(){
		
		try {
			driver = new ChromeDriver();
			
			driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
			driver.manage().window().maximize();
			
			//Initialize UserAction for Chrome
			userAction = new UserActionChrome();
			userAction.setRtl(isRtlTrue());
			
		}catch(Exception e){
			e.printStackTrace();
			return false;
		}
		
		return true;
	}
	
	
	/** API: Get JavaScript Executor by current driver */
	protected JavascriptExecutor getJsExecutor(){
		
		return ((JavascriptExecutor) driver);
	}

	/** API: Get a full with parameters */
	protected String getFullUrl(String targetUrl){
		
		return baseUrl + targetUrl + "?" + "sap-ui-theme=" + config.getUrlParameterTheme() + "&"
				                              + "sap-ui-rtl=" + config.getUrlParameterRtl() + "&"
				                              + "sap-ui-jqueryversion=" + config.getUrlParameterJquery();
	}
	
	/** API: Take a snapShot for a specific element */
	public boolean takeSnapShot(String elementId, String fileName){
		
		Dimension d = userAction.getElementDimension(driver, elementId);
		
		return takeSnapShot(elementId, d.width, d.height, fileName);

	}
	
	/** API: Take a snapshot based on starting a element and specific dimension */
	public boolean takeSnapShot(String elementId, int width, int height, String fileName){
		
		Point location = userAction.getElementLocation(driver, elementId);
		return takeSnapShot(location.x, location.y, width, height, fileName);
	}

	/** Take a screen shot based on specific location and dimension */
	private boolean takeSnapShot(int locationX, int locationY, int width, int height, String fileName, boolean needWrapName){
		
		String filePath = genFullPathForNeedVerifyImage(fileName, needWrapName);
		Point location = new Point(locationX, locationY);
		Dimension dimension = new Dimension(width, height);
		
		if (Utility.takeSnapShot(location, dimension, filePath)){
			
			logTakeScreenShot(filePath);
			return true;
		}
		
		return false;
	}
	
	/** API: Take a screen shot based on specific location and dimension */
	public boolean takeSnapShot(int locationX, int locationY, int width, int height, String fileName){
		
		return 	takeSnapShot(locationX, locationY, width, height, fileName, true);
	}

	/** Take a full screen shot */
	private boolean takeScreenShot(String fileName, boolean needWrapName){
		
		String filePath = genFullPathForNeedVerifyImage(fileName, needWrapName);
		
		if (Utility.takeScreenShot(driver, filePath)){
			
			logTakeScreenShot(filePath);
			return true;
		}
		
		return false;
	}
	
	/** API: Take a full screen shot */
	public boolean takeScreenShot(String fileName){
		
		return takeScreenShot(fileName, true);
	}
	
	/** Generate full path for image which need be verified */
	private String genFullPathForNeedVerifyImage(String fileName, boolean neeWrapName){
		
		if (neeWrapName){
			
			String fullPath = needVerifyImagesDIR + expectedImagePrefix + fileName + expectedImageSuffix;
			return fullPath;
			
		}else{
			
			return needVerifyImagesDIR + fileName;
		}
	}
	
	/** Generate full path for expected images */
	private String genFullPathForExpectedImage(String fileName, boolean neeWrapName){
		
		if (neeWrapName){
			
			String fullPath = expectedImagesDIR + expectedImagePrefix + fileName + expectedImageSuffix;
			return fullPath;
			
		}else{

			return expectedImagesDIR + fileName;
		}
	}

	/** Print log when take a screen shot */
	private void logTakeScreenShot(String fullFilePath){
		System.out.println("A image is created in: " + fullFilePath);
	}
	
	/** Create a file for temp image */
	private File createTempImageFile() throws Exception{
		
		File tempFile;
		tempFile = File.createTempFile("temp", "." + Constants.IMAGE_TYPE, new File(tempImagesDIR));
		return tempFile;
		
	}
	
	/** Create a file for diff image */
	private File createDiffImageFile() throws Exception{
		
		File fileDiff = File.createTempFile(diffImagePrefix, diffImageSuffix, new File(diffImagesDIR));
		return fileDiff;
		
	}
	
	
	/** API: Verify specific element UI by image comparing */
	public void verifyElementUI(String elementId, String expectedImageName){
		
		Point location = userAction.getElementLocation(driver, elementId);
		Dimension dimension = userAction.getElementDimension(driver, elementId);
		
		verifyCustomizedDimension(location.x, location.y, dimension.width, dimension.height, expectedImageName);
	}
	
	/** API: Verify UI part with customized dimension */
	public void verifyCustomizedDimension(String elementId, int width, int height, String expectedImageName){
	
		Point location = userAction.getElementLocation(driver, elementId);

		verifyCustomizedDimension(location.x, location.y, width, height, expectedImageName);
	}

	/** Verify UI part with customized dimension */
	private boolean verifyCustomizedDimension(Point location, Dimension dimension, File expectedImage){
		
		File fileDiff;
		try {
			fileDiff = createDiffImageFile();
		} catch (Exception e1) {
			System.out.println("Failed to create diff file!");
			e1.printStackTrace();
			return false;
		}
 		
		if (expectedImage == null){
			return false;
		}
		
		if (expectedImage.exists()){
			
			File tempFile;
			try {
				
				tempFile = createTempImageFile();
			} catch (Exception e) {
				
				e.printStackTrace();
				return false;
			}
			
			if (!Utility.takeSnapShot(location, dimension, tempFile.getPath())){
				
				tempFile.delete();
				fileDiff.delete();
				return false;
			}
			
			return compareImages(expectedImage, tempFile, fileDiff);
			
		}else{
			
			
			boolean isSuccess = takeSnapShot(location.x, location.y, dimension.width, dimension.height, expectedImage.getName(), false);
			return handleImagesMissed(isSuccess, expectedImage, fileDiff);
		}
	}

	/** API: Verify UI part with customized dimension */
	public void verifyCustomizedDimension(int locationX, int locationY, int width, int height, String expectedImageName){
		
		File expectedImage = new File(genFullPathForExpectedImage(expectedImageName, true));	
		
		Assert.assertTrue("Customized Dimension UI is matched? ", verifyCustomizedDimension(new Point(locationX, locationY), new Dimension(width, height),  expectedImage));
	}
	
	/** API: Verify UI of browser view box */
	public void verifyBrowserViewBox(String expectedImageName){
	    
	    Point viewBoxLocation = userAction.getBrowserViewBoxLocation(driver);
	    Dimension viewBoxDimension = userAction.getBrowserViewBoxDimension(driver);
	    
	    verifyCustomizedDimension(viewBoxLocation.x, viewBoxLocation.y, 
	                              viewBoxDimension.width, viewBoxDimension.height, 
	                              expectedImageName); 
	}
	

	/** Verify full page UI by image comparing */
 	private boolean verifyFullPageUI(File expectedImage){
 		
		File fileDiff;
		try {
			fileDiff = createDiffImageFile();
		} catch (Exception e1) {
			System.out.println("Failed to create diff file!");
			e1.printStackTrace();
			return false;
		}
 		
		if (expectedImage == null){
			return false;
		}
		
 		
		if (expectedImage.exists()){
			
			File tempFile;
			try {
				
				tempFile = createTempImageFile();	
			} catch (Exception e) {
				
				e.printStackTrace();
				return false;
			}
			
			if (!Utility.takeScreenShot(driver, tempFile.getPath())){
				
				tempFile.delete();
				fileDiff.delete();
				return false;
			}
			
			return compareImages(expectedImage, tempFile, fileDiff);

			
		}else{
			
			boolean isSuccess = takeScreenShot(expectedImage.getName(), false);
			return handleImagesMissed(isSuccess, expectedImage, fileDiff);
		}
 		
	}
	
	/** API: Verify full page UI by image comparing */
	public void verifyFullPageUI(String expectedImageName){
		
		File expectedImage = new File(genFullPathForExpectedImage(expectedImageName, true));
		
		Assert.assertTrue("Full Page UI is matched?: ", verifyFullPageUI(expectedImage));
	}
	
	
	/** Handler when expected images are missed */
	private boolean handleImagesMissed(boolean newImageStatus, File expectedImage, File fileDiff){
		
		if (newImageStatus){
			
		}else{
			
			System.out.println("Failed to create a image at path: " + needVerifyImagesDIR + expectedImage.getName());
		}
		
		fileDiff.delete();
		return service.isDevMode();
	}
	
	/** Compare images and set parameter: pixelThreshold and colorDistance  */
	private boolean compareImages(File expectedImage, File tempFile, File fileDiff, StringBuilder resultMessage) throws Exception{
		
		int pixelThreshold = 0;
		int colorDistance = 0;
		
		return Utility.imageComparer(expectedImage, tempFile, fileDiff, colorDistance, pixelThreshold, resultMessage);
		
	}

	/** Compare Images files */
	private boolean compareImages(File expectedImage, File tempFile, File fileDiff){
		
		StringBuilder resultMessage = new StringBuilder();
		
		boolean isMatched;
		try {
			
			isMatched = compareImages(expectedImage, tempFile, fileDiff, resultMessage);
		} catch (Exception e) {
			
			System.out.println("Errors occur during image comparing, Stop this image comparing! ");
			e.printStackTrace();
			
			tempFile.delete();
			if (fileDiff != null && fileDiff.exists()){
				fileDiff.delete();
			}
			
			return false;
		}

		if (isMatched){
			
			tempFile.delete();
			
			if (fileDiff != null && fileDiff.exists()){
				fileDiff.delete();
			}
			
		}else{
			//Move temp Image to need verify folder
			tempFile.renameTo(new File(needVerifyImagesDIR + expectedImage.getName()));
	
			System.out.println("The new candidate image is saved on: " + needVerifyImagesDIR + expectedImage.getName());
			System.out.println("Differ Image is created on: " + fileDiff.getPath());
		}
		
		System.out.println(resultMessage.toString());
		return isMatched;
		
	}
	
	/** Return true if "sap-ui-rtl" is true */
	public boolean isRtlTrue(){
		
		if (Boolean.parseBoolean(config.getUrlParameterRtl()) == true){
			return true;
		}else{
			return false;
		}
	}
	
	/** Wait for a specific time */
	public void waitForReady(int millisecond){
		try {
			Thread.sleep(millisecond);
		} catch (InterruptedException e) {
			e.printStackTrace();
			Assert.fail("Thread.sleep method is failed to wait for ready!");
		}
	}
	
	/** Get all elements by id */
	public List<WebElement> getElementsByTagName(String tagName){
		
		return driver.findElements(By.tagName(tagName));
	}	
	
	
	/** Get all elements by class Name */
	public List<WebElement> getElementsByClassName(String className){
		
		return driver.findElements(By.className(className));
	}
	
}
