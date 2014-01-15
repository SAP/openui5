package com.sap.ui5.selenium.common;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.awt.im.InputContext;
import java.io.File;
import java.net.URL;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.action.UserActionChrome;
import com.sap.ui5.selenium.action.UserActionFirefox;
import com.sap.ui5.selenium.action.UserActionFirefoxESR;
import com.sap.ui5.selenium.action.UserActionIE10;
import com.sap.ui5.selenium.action.UserActionIE11;
import com.sap.ui5.selenium.action.UserActionIE8;
import com.sap.ui5.selenium.action.UserActionIE9;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.Utility;

public class TestBase extends CommonBase {

	private static boolean isBeforeClass = true;

	private final Config config = Config.INSTANCE;
	private final InitService service = InitService.INSTANCE;

	public IUserAction userAction;

	private final String baseUrl = service.getBaseURL(); // "http://veui5infra.dhcp.wdf.sap.corp:8080/uilib-sample";

	// Image repository for the current test runtime
	private final String imagesBasePath = service.getImagesBasePath();

	// Image directory for each test class
	private final String testDIR = getTestDIR();

	// For expected images
	private final String expectedImagesDIR = testDIR + fileSeparator + "ExpectedImages" + fileSeparator;

	// The images for manual check
	private final String needVerifyImagesDIR = testDIR + fileSeparator + "NeedVerifyImages" + fileSeparator;

	// Temporary Image DIR. It should be empty before testing.
	private final String tempImagesDIR = testDIR + fileSeparator + "TempImages" + fileSeparator;

	// differ image DIR. It should be empty before testing
	private final String diffImagesDIR = testDIR + fileSeparator + "DiffImages" + fileSeparator;

	// Prefix and Suffix for Image file
	private final String expectedImagePrefix = "";
	private final String diffImagePrefix = "";
	private final String expectedImageSuffix = "." + Constants.IMAGE_TYPE;
	private final String diffImageSuffix = "-diff." + Constants.IMAGE_TYPE;

	// The message of image compared results
	private StringBuilder resultsMessage;

	public TestBase() {

		initialize();
	}

	/** Common initialization for all tests */
	private void initialize() {

		// Check if 4 base directories is OK
		createDIR(expectedImagesDIR);
		createDIR(needVerifyImagesDIR);
		createDIR(tempImagesDIR);
		createDIR(diffImagesDIR);

		// Clean files before testing
		if (isBeforeClass == true) {
			deleteAllFilesInDirectory(new File(tempImagesDIR));
			deleteAllFilesInDirectory(new File(diffImagesDIR));
			deleteAllFilesInDirectory(new File(needVerifyImagesDIR));

			isBeforeClass = false;
		}

	}

	@BeforeClass
	public static void beforeClassBase() {
		isBeforeClass = true;
	}

	@AfterClass
	public static void afterClassBase() {
	}

	@Before
	public void baseSetUp() {
		logTestStart();

		// initial WebDriver
		getDriver();
	}

	@After
	public void baseTearDown() {
		driver.quit();
		logTestEnd();
	}

	/** Create target directory by full path*/
	private void createDIR(String Path) {

		File targetDIR = new File(Path);

		if (!targetDIR.exists()) {
			targetDIR.mkdirs();
		}
	}

	/** Delete all files in a directory */
	private boolean deleteAllFilesInDirectory(File directory) {

		if (!directory.isDirectory()) {
			return false;
		}

		boolean isSuccess = true;
		File[] files = directory.listFiles();

		for (int i = 0; i < files.length; i++) {

			isSuccess = isSuccess && files[i].delete();
		}

		return isSuccess;
	}

	/** Get testDIR path with starting "modules" sub-package */
	private String getTestDIR() {

		String fullName = this.getClass().getName();
		String modulesPackage = ".modules.";
		String testsPackage = ".tests.";

		if (!fullName.contains(modulesPackage) || !fullName.contains(testsPackage)) {

			System.out.println("Your package is not correct, please check!");
			System.out.println("Correct package need contain modules and tests package!");
			System.out.println("eg: com.sap.ui5.modules.commons.tests.ButtonTest.java");
			System.exit(1);
		}

		fullName = fullName.replace(".tests.", ".");
		int index = fullName.lastIndexOf(modulesPackage) + modulesPackage.length();
		fullName = fullName.substring(index);

		return imagesBasePath + fileSeparator + fullName.replace(".", fileSeparator);
	}

	/** Get browser type, it is defined in Constants.Class */
	public int getBrowserType() {
		return service.getBrowserType();
	}

	/** Get UI5 theme type, it is defined in Constants.Class */
	public int getThemeType() {
		return service.getThemeType();
	}

	/** Initial WebDriver and return the instance */
	private WebDriver getDriver() {

		// Get target driver
		switch (getBrowserType()) {
		case Constants.FIREFOX:
		case Constants.FIREFOX_ESR:
			if (!initializeFirefoxDriver()) {
				if (driver != null) {
					driver.quit();
					driver = null;
					System.out.println("Failed to initialize FireFoxDriver!");
				}
			}
			break;

		case Constants.IE8:
		case Constants.IE9:
		case Constants.IE10:
		case Constants.IE11:
			if (!initializeIEDriver()) {
				if (driver != null) {
					driver.quit();
					driver = null;
					System.out.println("Failed to initialize IEDriver!");
				}
			}
			break;

		case Constants.CHROME:
			if (!initializeChromeDriver()) {
				if (driver != null) {
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

	/** Initial WebDriver common setting */
	private void initializeDriverSetting(WebDriver driver) {

		driver.manage().timeouts().implicitlyWait(implicitlyWaitTime, TimeUnit.SECONDS);
		driver.manage().timeouts().setScriptTimeout(scriptTimeout, TimeUnit.SECONDS);
		driver.manage().timeouts().pageLoadTimeout(pageLoadTimeout, TimeUnit.SECONDS);
		driver.manage().window().maximize();
	}

	/** Initial Remote Driver */
	private boolean initializeRemoteDriver(DesiredCapabilities capability) {

		capability.setVersion(config.getBrowserVersion());
		capability.setJavascriptEnabled(true);
		capability.setPlatform(service.getTargetPlatform());

		URL remoteUrl;

		try {
			remoteUrl = new URL(service.getRemoteSeleniumServerURL());
			driver = new RemoteWebDriver(remoteUrl, capability);
			initializeDriverSetting(driver);
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
		return true;
	}

	/** Initialize Firefox Driver */
	private boolean initializeFirefoxDriver() {

		DesiredCapabilities capability = DesiredCapabilities.firefox();

		// Initial Remote Firefox Driver
		if (service.isRemoteEnv()) {
			return initializeRemoteDriver(capability);
		}

		try {
			// Initial Local Firefox Driver
			driver = new FirefoxDriver(capability);
			initializeDriverSetting(driver);
			if (hideFirefoxStatusBar() == false) {
				return false;
			}

			// Initialize UserAction for Firefox/FirefoxESR
			if (getBrowserType() == Constants.FIREFOX) {
				userAction = new UserActionFirefox();
			} else {
				userAction = new UserActionFirefoxESR();
			}
			userAction.setRtl(isRtlTrue());

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

		return true;
	}

	/** Click the two buttons "Ctrl" and "/" at the same time on the keyboard. 
	 *  To cancel the status bar of browser */
	private boolean hideFirefoxStatusBar() {

		Robot robot;
		try {
			robot = new Robot();
			robot.delay(1000);
			Locale keyBoardLocale = InputContext.getInstance().getLocale();

			// US KeyBoard
			if (keyBoardLocale.equals(Locale.US)) {
				robot.keyPress(KeyEvent.VK_CONTROL);
				robot.keyPress(KeyEvent.VK_SLASH);

				robot.keyRelease(KeyEvent.VK_SLASH);
				robot.keyRelease(KeyEvent.VK_CONTROL);

				return true;
			}

			// German KeyBorad
			if (keyBoardLocale.equals(Locale.GERMANY)) {
				robot.keyPress(KeyEvent.VK_CONTROL);
				robot.keyPress(KeyEvent.VK_SHIFT);
				robot.keyPress(KeyEvent.VK_7);

				robot.keyRelease(KeyEvent.VK_7);
				robot.keyRelease(KeyEvent.VK_SHIFT);
				robot.keyRelease(KeyEvent.VK_CONTROL);

				return true;
			}

			System.out.println("The current keyboard locale (" + keyBoardLocale
					+ ") is not supported");
			return false;

		} catch (AWTException e) {
			e.printStackTrace();
			return false;
		}
	}

	/** Initialize IE Driver */
	private boolean initializeIEDriver() {

		DesiredCapabilities capability = DesiredCapabilities.internetExplorer();
		capability.setCapability(InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, true);

		// Initial Remote IE Driver
		if (service.isRemoteEnv()) {
			return initializeRemoteDriver(capability);
		}

		try {
			// Initial local IE Driver
			driver = new InternetExplorerDriver(capability);
			initializeDriverSetting(driver);

			// Initialize UserAction for IE
			switch (getBrowserType()) {

			case Constants.IE8:
				userAction = new UserActionIE8();
				break;

			case Constants.IE9:
				userAction = new UserActionIE9();
				break;

			case Constants.IE10:
				userAction = new UserActionIE10();
				break;

			case Constants.IE11:
				userAction = new UserActionIE11();
				break;

			}

			userAction.setRtl(isRtlTrue());

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

		return true;
	}

	/** Initialize Chrome Driver */
	private boolean initializeChromeDriver() {

		DesiredCapabilities capability = DesiredCapabilities.chrome();

		// Initial Remote Chrome Driver
		if (service.isRemoteEnv()) {

			return initializeRemoteDriver(capability);
		}

		try {
			// Initial local Chrome Driver
			driver = new ChromeDriver(capability);
			initializeDriverSetting(driver);

			// Initialize UserAction for Chrome
			userAction = new UserActionChrome();
			userAction.setRtl(isRtlTrue());

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

		return true;
	}

	/** API: Get a full with parameters */
	protected String getFullUrl(String targetUrl) {

		return baseUrl + targetUrl + "?" + "sap-ui-theme=" + config.getUrlParameterTheme() + "&"
				+ "sap-ui-rtl=" + config.getUrlParameterRtl() + "&"
				+ "sap-ui-jqueryversion=" + config.getUrlParameterJquery();
	}

	/** Take a screen shot based on specific location and dimension */
	private boolean takeSnapShot(int locationX, int locationY, int width, int height, String fileName, boolean needWrapName) {

		waitForUI();
		String filePath = genFullPathForNeedVerifyImage(fileName, needWrapName);
		Point location = new Point(locationX, locationY);
		Dimension dimension = new Dimension(width, height);

		if (Utility.takeSnapShot(location, dimension, filePath)) {

			logTakeScreenShot(filePath);
			return true;
		}

		return false;
	}

	/** Take a picture of full html page by WebDriver */
	private boolean takeFullPage(String fileName, boolean needWrapName) {

		waitForUI();
		String filePath = genFullPathForNeedVerifyImage(fileName, needWrapName);

		if (Utility.takeFullPage(driver, filePath)) {

			logTakeScreenShot(filePath);
			return true;
		}

		return false;
	}

	/** Generate full path for image which need be verified */
	private String genFullPathForNeedVerifyImage(String fileName, boolean needWrapName) {

		if (needWrapName) {

			String fullPath = needVerifyImagesDIR + expectedImagePrefix + fileName + expectedImageSuffix;
			return fullPath;

		} else {

			return needVerifyImagesDIR + fileName;
		}
	}

	/** Generate full path for expected images */
	private String genFullPathForExpectedImage(String fileName, boolean needWrapName) {

		if (needWrapName) {

			String fullPath = expectedImagesDIR + expectedImagePrefix + fileName + expectedImageSuffix;
			return fullPath;

		} else {

			return expectedImagesDIR + fileName;
		}
	}

	/** Generate full path for diff images */
	private String genFullPathForDiffImage(String fileName, boolean needWrapName) {

		if (needWrapName) {

			String fullPath = diffImagesDIR + diffImagePrefix + fileName + diffImageSuffix;
			return fullPath;

		} else {

			return diffImagesDIR + fileName;
		}
	}

	/** Print log when take a screen shot */
	private void logTakeScreenShot(String fullFilePath) {
		System.out.println("A candidate image is created in: " + fullFilePath);
	}

	/** Create a file for temp image */
	private File createTempImageFile() throws Exception {

		File tempFile;
		tempFile = File.createTempFile("temp", "." + Constants.IMAGE_TYPE, new File(tempImagesDIR));
		return tempFile;

	}

	/** API: Verify specific element UI by image comparing */
	public void verifyElement(String elementId, String expectedImageName) {

		Point location = userAction.getElementLocation(driver, elementId);
		Dimension dimension = userAction.getElementDimension(driver, elementId);

		// if the element size > browserViewBox size,
		// only take the screenshot of the element in browser view box.

		Point viewBoxStartPoint = userAction.getBrowserViewBoxLocation(driver);
		Dimension viewBoxDimension = userAction.getBrowserViewBoxDimension(driver);
		Point viewBoxEndPoint = new Point(viewBoxStartPoint.x + viewBoxDimension.width, viewBoxStartPoint.y + viewBoxDimension.height);

		int width = dimension.width;
		int height = dimension.height;
		if ((location.x + dimension.width) > viewBoxEndPoint.x) {
			width = viewBoxEndPoint.x - location.x;
		}

		if ((location.y + dimension.height) > viewBoxEndPoint.y) {
			height = viewBoxEndPoint.y - location.y;
		}

		verifyArea(location.x, location.y, width, height, expectedImageName);
	}

	/** API: Assert specific element UI by image comparing */
	public void assertElement(String elementId, String expectedImageName) {

		Point location = userAction.getElementLocation(driver, elementId);
		Dimension dimension = userAction.getElementDimension(driver, elementId);

		assertArea(location.x, location.y, dimension.width, dimension.height, expectedImageName);
	}

	/** API: Verify UI part with customized dimension */
	public void verifyArea(String elementId, int width, int height, String expectedImageName) {

		Point location = userAction.getElementLocation(driver, elementId);

		verifyArea(location.x, location.y, width, height, expectedImageName);
	}

	/** API: Assert UI part with customized dimension */
	public void assertArea(String elementId, int width, int height, String expectedImageName) {

		Point location = userAction.getElementLocation(driver, elementId);

		assertArea(location.x, location.y, width, height, expectedImageName);
	}

	/** Verify UI part with customized dimension */
	private boolean verifyArea(Point location, Dimension dimension, String expectedImageName) {

		File expectedImage;
		File actualImage;
		File diffImage;
		try {
			expectedImage = new File(genFullPathForExpectedImage(expectedImageName, true));
			actualImage = createTempImageFile();
			diffImage = createTempImageFile();

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

		if (expectedImage.exists()) {

			if (!Utility.takeSnapShot(location, dimension, actualImage.getPath())) {

				actualImage.delete();
				diffImage.delete();
				return false;
			}

			boolean results = compareImages(expectedImage, actualImage, diffImage);

			if (!results) {

				// Move actual Image to need verify folder
				Utility.moveFile(actualImage, new File(needVerifyImagesDIR + expectedImage.getName()));

				// Move Diff Image to diff folder
				Utility.moveFile(diffImage, new File(genFullPathForDiffImage(expectedImageName, true)));

				System.out.println("New candidate image is created on: " + needVerifyImagesDIR + expectedImage.getName());
				System.out.println("Differ image is created on: " + genFullPathForDiffImage(expectedImageName, true));
			}

			return results;

		} else {

			boolean isSuccess = takeSnapShot(location.x, location.y, dimension.width, dimension.height, expectedImage.getName(), false);
			return handleImagesMissed(isSuccess, expectedImage, diffImage);
		}
	}

	/** API: Verify UI part with customized dimension */
	public void verifyArea(int locationX, int locationY, int width, int height, String expectedImageName) {

		waitForUI();
		resultsMessage = new StringBuilder();
		boolean results = verifyArea(new Point(locationX, locationY), new Dimension(width, height), expectedImageName);
		resultsMessageWrapper(expectedImageName);
		verifyTrue(resultsMessage.toString(), results);
		resultsMessage = null;
	}

	private void resultsMessageWrapper(String expectedImageName) {

		String newLine = "\n";
		String expectedImagePath = genFullPathForExpectedImage(expectedImageName, true);
		String needVerifyImagePah = genFullPathForNeedVerifyImage(expectedImageName, true);
		String diffImagePath = genFullPathForDiffImage(expectedImageName, true);
		File expectedImage = new File(expectedImagePath);
		File needVerifyImage = new File(needVerifyImagePah);
		File diffImage = new File(diffImagePath);

		if (resultsMessage == null) {
			resultsMessage = new StringBuilder();
		}

		resultsMessage.insert(0, "\n####  Comparing: " + expectedImage.getName() + " (" + getClass().getSimpleName() + "." + testName.getMethodName() + ")    ==> FAILED" + newLine);
		if (needVerifyImage.exists()) {
			resultsMessage.append("New candidate image is created on: " + needVerifyImagePah + newLine);
		}

		if (expectedImage.exists()) {
			resultsMessage.append("Expected image is on: " + expectedImagePath + newLine);
		}

		if (diffImage.exists()) {
			resultsMessage.append("Diff image is created on: " + diffImagePath + newLine);

			File source = diffImage;
			File destDIR = new File("target/surefire-reports/" + getClass().getName());
			destDIR.mkdirs();
			File dest = new File(destDIR, diffImage.getName());
			Utility.copyFile(source, dest);

			resultsMessage.append(newLine + "[[ATTACHMENT|" + dest.getAbsolutePath() + "]]" + newLine);
		}
	}

	/** API: Assert UI part with customized dimension */
	public void assertArea(int locationX, int locationY, int width, int height, String expectedImageName) {

		waitForUI();
		Assert.assertTrue("Customized Dimension UI is matched? ", verifyArea(new Point(locationX, locationY), new Dimension(width, height), expectedImageName));
	}

	/** API: Verify UI of browser view box */
	public void verifyBrowserViewBox(String expectedImageName) {

		Point viewBoxLocation = userAction.getBrowserViewBoxLocation(driver);
		Dimension viewBoxDimension = userAction.getBrowserViewBoxDimension(driver);

		verifyArea(viewBoxLocation.x, viewBoxLocation.y,
				viewBoxDimension.width, viewBoxDimension.height,
				expectedImageName);
	}

	/** API: Assert UI of browser view box */
	public void assertBrowserViewBox(String expectedImageName) {

		Point viewBoxLocation = userAction.getBrowserViewBoxLocation(driver);
		Dimension viewBoxDimension = userAction.getBrowserViewBoxDimension(driver);

		assertArea(viewBoxLocation.x, viewBoxLocation.y,
				viewBoxDimension.width, viewBoxDimension.height,
				expectedImageName);
	}

	/** Verify full page UI by image comparing */
	private boolean verifyFullPage(String expectedImageName) {

		File expectedImage;
		File actualImage;
		File diffImage;
		try {
			expectedImage = new File(genFullPathForExpectedImage(expectedImageName, true));
			actualImage = createTempImageFile();
			diffImage = createTempImageFile();

		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

		if (expectedImage.exists()) {

			if (!Utility.takeFullPage(driver, actualImage.getPath())) {

				actualImage.delete();
				diffImage.delete();
				return false;
			}

			boolean results = compareImages(expectedImage, actualImage, diffImage);

			if (!results) {

				// Move actual Image to need verify folder
				Utility.moveFile(actualImage, new File(needVerifyImagesDIR + expectedImage.getName()));

				// Move Diff Image to diff folder
				Utility.moveFile(diffImage, new File(genFullPathForDiffImage(expectedImageName, true)));

				System.out.println("New candidate image is created on: " + needVerifyImagesDIR + expectedImage.getName());
				System.out.println("Differ image is created on: " + genFullPathForDiffImage(expectedImageName, true));
			}

			return results;

		} else {

			boolean isSuccess = takeFullPage(expectedImage.getName(), false);
			return handleImagesMissed(isSuccess, expectedImage, diffImage);
		}

	}

	/** API: Verify full page UI by image comparing */
	public void verifyPage(String expectedImageName) {

		waitForUI();
		resultsMessage = new StringBuilder();
		boolean results = verifyFullPage(expectedImageName);
		resultsMessageWrapper(expectedImageName);
		verifyTrue(resultsMessage.toString(), results);
		resultsMessage = null;
	}

	/** API: Assert full page UI by image comparing */
	public void assertPage(String expectedImageName) {

		waitForUI();
		Assert.assertTrue("Full Page UI is matched?: ", verifyFullPage(expectedImageName));
	}

	/** Handler when expected images are missed */
	private boolean handleImagesMissed(boolean takeSnapshotSuccess, File expectedImage, File fileDiff) {

		if (!takeSnapshotSuccess) {

			System.out.println("Failed to create a image at path: " + needVerifyImagesDIR + expectedImage.getName());
		}

		fileDiff.delete();
		return service.isDevMode();
	}

	/** Compare images and set parameter: pixelThreshold and colorDistance  */
	private boolean compareImages(File expectedImage, File actualImage, File diffImage, StringBuilder resultMessage) throws Exception {

		int pixelThreshold = 100;
		int colorDistance = 5;

		return Utility.imageComparer(expectedImage, actualImage, diffImage, colorDistance, pixelThreshold, resultMessage);

	}

	/** Compare Images files */
	private boolean compareImages(File expectedImage, File actualImage, File diffImage) {

		if (resultsMessage == null) {
			resultsMessage = new StringBuilder();
		}

		boolean isMatched;
		try {

			System.out.println();
			System.out.print("####  " + "Comparing: " + expectedImage.getName() +
					" (" + getClass().getSimpleName() + "." + testName.getMethodName() + ")");
			isMatched = compareImages(expectedImage, actualImage, diffImage, resultsMessage);
		} catch (Exception e) {

			System.out.println("    ==> FAILED");
			System.out.println("Errors occur during image comparing, Stop this image comparing! ");
			System.out.println("#####################");
			e.printStackTrace();
			System.out.println("#####################");

			Utility.deleteFile(actualImage);
			Utility.deleteFile(diffImage);
			return false;
		}

		if (isMatched) {

			System.out.println("    ==> PASS");
			Utility.deleteFile(actualImage);
			Utility.deleteFile(diffImage);

		} else {
			System.out.println("    ==> FAILED");
			System.out.print(resultsMessage.toString());
		}

		return isMatched;

	}

	/** Return true if "sap-ui-rtl" is true */
	public boolean isRtlTrue() {

		if (Boolean.parseBoolean(config.getUrlParameterRtl()) == true) {
			return true;
		} else {
			return false;
		}
	}

	/** Show Tooltip for all browser by wrapping userAction.mouseOver() */
	public void showToolTip(String elementId, int waitTimeMillsecond) {

		if ((getBrowserType() == Constants.FIREFOX) || (getBrowserType() == Constants.FIREFOX_ESR)) {
			userAction.mouseOver(driver, elementId, waitTimeMillsecond);
			userAction.mouseMoveToStartPoint(driver);
		}

		userAction.mouseOver(driver, elementId, waitTimeMillsecond);
	}

	/** Multiple Tab based on the specific number */
	public void multipleTabs(int tabsNumber) {

		for (int j = 0; j < tabsNumber; j++) {
			userAction.pressOneKey(KeyEvent.VK_TAB);
		}
	}

	/** Is current browser IE */
	public boolean browserIsIE() {

		return (getBrowserType() / 10 == Constants.IE8 / 10);
	}

	/** Is current browser Firefox */
	public boolean browserIsFirefox() {

		return (getBrowserType() / 10 == Constants.FIREFOX / 10);
	}

	/** Is current browser Chrome */
	public boolean browserIsChrome() {

		return (getBrowserType() / 10 == Constants.CHROME / 10);
	}

}
