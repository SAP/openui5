package com.sap.selenium.common;

import org.openqa.selenium.By;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public abstract class CommonBase {
	
	protected WebDriver driver;
	
	protected String fileSeparator = System.getProperty("file.separator");
	

	/** API: Check target element is existing? */
	protected boolean isElementPresent(By by) {
		try {
			driver.findElement(by);
			return true;
		} catch (NoSuchElementException e) {
			return false;
		}
	}
	
	/** API: Check target Alert is existing? */
	protected boolean isAlertPresent(){
		
		try {
			driver.switchTo().alert();
			return true;
		}catch (NoAlertPresentException e) {
			return false;
		}
	}
	
	/** API: Check target element is enabled? */
	protected boolean isElementEnabled(WebElement element){
		String ariaDisabled = element.getAttribute("aria-disabled");
		
		//If attribute "aria-disabled" is not set or has not value, then use selenium native method
		if ((ariaDisabled == null) || ariaDisabled.isEmpty() ){
			
			return element.isEnabled();
			
		}else {
			
			return !Boolean.parseBoolean(ariaDisabled);
			
		}	
	}
	
	

}
