package com.sap.ui5.selenium.common;

import java.util.List;

import org.hamcrest.CoreMatchers;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.rules.ErrorCollector;
import org.junit.rules.TestName;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public abstract class CommonBase {
	
	protected WebDriver driver;
	
	protected String fileSeparator = System.getProperty("file.separator");
	
	@Rule
    public ErrorCollector errorCollector = new ErrorCollector();
	
	@Rule 
	public TestName testName = new TestName();
	
	
	/** API: Get JavaScript Executor by current driver */
    protected JavascriptExecutor getJsExecutor(){
        
        return ((JavascriptExecutor) driver);
    }
	
	/** API: Check target element is existing? */
	public boolean isElementPresent(By by) {
		try {
			driver.findElement(by);
			return true;
		} catch (NoSuchElementException e) {
			return false;
		}
	}
	
	/** API: Check target Alert is existing? */
	public boolean isAlertPresent(){
		
		try {
			driver.switchTo().alert();
			return true;
		}catch (NoAlertPresentException e) {
			return false;
		}
	}
	
	/** API: Check target element is enabled? */
	public boolean isElementEnabled(WebElement element){
		String ariaDisabled = element.getAttribute("aria-disabled");
		
		//If attribute "aria-disabled" is not set or has not value, then use selenium native method
		if ((ariaDisabled == null) || ariaDisabled.isEmpty() ){
			
			return element.isEnabled();
			
		}else {
			
			return !Boolean.parseBoolean(ariaDisabled);
			
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
    
    /** Get all elements by tag name */
	public List<WebElement> getElementsByTagName(String tagName){
        
        return driver.findElements(By.tagName(tagName));
    }   
    
    
    /** Get all elements by class Name */
	public List<WebElement> getElementsByClassName(String className){
        
        return driver.findElements(By.className(className));
    }
	
	/**
	 * Waits until the application is ready.
	 * Covers Core initialization, delays in rendering and active jQuery requests
	 */
	public void waitForUI() {

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

	/** Verify* methods does not abort test execution even if it is failed,
	 *  only log the error. mark test failure at end of test */
	public void verifyTrue(boolean actual){
		
		errorCollector.checkThat(actual, CoreMatchers.equalTo(true));
	}
	
	public void verifyFalse(boolean actual){
		
		errorCollector.checkThat(actual, CoreMatchers.equalTo(false));
	}
	
	/** Verify* methods does not abort test execution even if it is failed, 
	 *  only log the error. mark test failure at end of test */
	public <T> void verifyEquals(T actual, T expected){
		
		errorCollector.checkThat(actual, CoreMatchers.equalTo(expected));
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
