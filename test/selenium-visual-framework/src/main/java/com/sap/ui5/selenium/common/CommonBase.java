package com.sap.ui5.selenium.common;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.hamcrest.CoreMatchers;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.rules.ErrorCollector;
import org.junit.rules.TestName;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.sap.ui5.selenium.util.UI5ExpectedConditions;
import com.sap.ui5.selenium.util.UI5Timeout;

public abstract class CommonBase {

	public static WebDriver driver;
	protected final long implicitlyWaitTime = 30;
	protected final long scriptTimeout = 30;
	protected final long pageLoadTimeout = 90;
	protected final long domLoadTimeout = 30;
	protected final int ui5TimeoutInSecond = 60 * 15; // 15 minutes

	protected String fileSeparator = System.getProperty("file.separator");

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(ui5TimeoutInSecond * 1000);

	@Rule
	public ErrorCollector errorCollector = new ErrorCollector();

	@Rule
	public TestName testName = new TestName();

	/** API: Get JavaScript Executor by current driver */
	protected JavascriptExecutor getJsExecutor() {

		return ((JavascriptExecutor) driver);
	}

	/** Wait for a specific time */
	public void waitForReady(int millisecond) {
		try {
			Thread.sleep(millisecond);
		} catch (InterruptedException e) {
			e.printStackTrace();
			Assert.fail("Thread.sleep method is failed to wait for ready!");
		}
	}

	/** Get all elements by tag name */
	public List<WebElement> getElementsByTagName(String tagName) {

		return driver.findElements(By.tagName(tagName));
	}

	/** Get all elements by class Name */
	public List<WebElement> getElementsByClassName(String className) {

		return driver.findElements(By.className(className));
	}

	/** Wait for UI ready */
	public void waitForUI() {

		// waitForDomReady(domLoadTimeout);
		// waitForUI5Ready();
	}

	/** Wait for DOM Ready */
	public void waitForDomReady(WebDriver driver, long timeOutSeconds) {

		WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);
		wait.until(UI5ExpectedConditions.domReady());
	}

	/**
	 * ****  the JS script is Disabled *****
	 * *************************************
	 * Waits until the application is ready.
	 * Covers Core initialization, delays in rendering and active jQuery requests
	 */
	@SuppressWarnings(value = { "unused" })
	private void waitForUI5Ready() {

		String code =
				"var callback = arguments[arguments.length - 1];" +
						"var waitForUI = function() {" +
						"if (typeof(sap) === 'undefined') {" +
						"callback(true);" + // waitforUI should only wait if UI5 is on the page
						"return;" +
						"}" +
						"var oCore = sap.ui.getCore();" +
						"var bIsBusy = !oCore.isInitialized() || oCore.isLocked() || oCore.getUIDirty() || jQuery.active > 0;" +
						"if (bIsBusy) {" +
						"setTimeout(waitForUI, 100);" +
						"} else {" +
						"callback(true);" +
						"}" +
						"}; setTimeout(waitForUI, 50);";

		try {
			getJsExecutor().executeAsyncScript(code);
		} catch (TimeoutException e) {
			// mysterious exception, also happens if script does not time out
		}
	}

	/** Wait for target element to visible or invisible  */
	public void waitForElement(WebDriver driver, boolean isVisible, By by, long timeOutSeconds) {

		driver.manage().timeouts().implicitlyWait(0, TimeUnit.SECONDS);

		try {
			WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);

			if (isVisible) {
				wait.until(UI5ExpectedConditions.visibilityOfElementLocated(by));
				Sleeper.sleepTight(1000);

			} else {
				wait.until(ExpectedConditions.invisibilityOfElementLocated(by));
			}

		} finally {
			driver.manage().timeouts().implicitlyWait(implicitlyWaitTime, TimeUnit.SECONDS);
		}
	}

	/** Wait for target element to visible or invisible  */
	public void waitForElement(WebDriver driver, boolean isVisible, String elementId, long timeOutSeconds) {
		By by = By.id(elementId);
		waitForElement(driver, isVisible, by, timeOutSeconds);
	}

	/** Verify* methods does not abort test execution even if it is failed,
	 *  only log the error. mark test failure at end of test */
	public void verifyTrue(String reason, boolean actual) {

		errorCollector.checkThat(reasonWrapper(reason), actual, CoreMatchers.equalTo(true));
	}

	public void verifyFalse(String reason, boolean actual) {

		errorCollector.checkThat(reasonWrapper(reason), actual, CoreMatchers.equalTo(false));
	}

	/** Verify* methods does not abort test execution even if it is failed, 
	 *  only log the error. mark test failure at end of test */
	public <T> void verifyEquals(String reason, T actual, T expected) {

		errorCollector.checkThat(reasonWrapper(reason), actual, CoreMatchers.equalTo(expected));
	}

	private String reasonWrapper(String reason) {
		return reason + "\n" + "--------------------";
	}

	public void logTestStart() {
		System.out.println();
		System.out.println("########  Test: " + getClass().getName() + "."
				+ testName.getMethodName() + " is started!" + "  ########");
	}

	public void logTestEnd() {
		System.out.println();
		System.out.println("########  Test: " + getClass().getName() + "."
				+ testName.getMethodName() + " is end!" + "  ########");
	}

}
