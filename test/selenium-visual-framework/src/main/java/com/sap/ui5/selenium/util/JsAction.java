package com.sap.ui5.selenium.util;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

public class JsAction {
	
	/** Get JS Executor*/
	private static JavascriptExecutor getJsExecutor(WebDriver driver) {
		
		return (JavascriptExecutor) driver;
	}
	
	/** Click an element by JS*/
	public static void clickElement(WebDriver driver, WebElement element) {
		String jsCode = "arguments[0].click();";
		
		getJsExecutor(driver).executeScript(jsCode, element);
	}
	
	/** Focus on an element by JS */
	public static void focusOnElement(WebDriver driver, WebElement element) {
		String jsCode = "arguments[0].focus()";
		
		getJsExecutor(driver).executeScript(jsCode, element);
		new Actions(driver).moveToElement(element).perform();
	}
	
	/** Blur on an element by JS */
	public static void blurElement(WebDriver driver, WebElement element) {
		String jsCode = "arguments[0].blur()";
		
		getJsExecutor(driver).executeScript(jsCode, element);
	}
	
	
}
