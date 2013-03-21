package com.sap.ui5.selenium.common;

import java.util.List;

import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public abstract class CommonBase {
	
	protected WebDriver driver;
	
	protected String fileSeparator = System.getProperty("file.separator");
	
	
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
	
	

}
