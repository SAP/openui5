package com.sap.ui5.selenium.action;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;

public class UserActionFirefox extends UserActionCommon{
    
 
	/** API: Get element location */
	@Override
	public Point getElementLocation(WebDriver driver, String elementId){
		
		scrollToElmentViewArea(driver, elementId);
		
		Point browserViewBoxLocation = getBrowserViewBoxLocation(driver);
		Point relativeLocation = getRelativeLocation(driver, elementId);
		
		Point elementScreenLocation = new Point(browserViewBoxLocation.x + relativeLocation.x, browserViewBoxLocation.y + relativeLocation.y);
		
		return elementScreenLocation;	
	}
	
	
	/** Get browser view box location,  browser view box to Screen 0,0 */
	@Override
	public Point getBrowserViewBoxLocation(WebDriver driver){
		
		// The Location X of the browser in the screen
		int screenX = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                 "var e = window.screenX;" +
	     		                 "return e;")).intValue(); 
		
		// The Location Y of the browser in the screen.
		int screenY = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = window.screenY;" +
	     		                "return e;")).intValue(); 
		
		// The width of browser.
		int outerWidth = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = window.outerWidth;" +
	     		                "return e;")).intValue(); 
		
		// The height of browser.
		int outerHeight = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = window.outerHeight;" +
	     		                "return e;")).intValue();
		
		
		Dimension browserViewDimension = getBrowserViewBoxDimension(driver);
		
		// The width of body including scroll bar.
		int innerWidth = browserViewDimension.width;
		
		// The height of body including scroll bar.
		int innerHeight = browserViewDimension.height;
		
		
		
		//Get absolute offset of browser view box to Screen 0,0
		int browserBorder = (outerWidth - innerWidth)/2;
	    int BrowserViewBoxLocationX = browserBorder + screenX;
	    int BrowserViewBoxLocationY = outerHeight - innerHeight - browserBorder + screenY;
		
	    return new Point(BrowserViewBoxLocationX, BrowserViewBoxLocationY);
	    
	}
	
	/** Get relative location of the element in browser view box */
	protected Point getRelativeLocation(WebDriver driver, String elementId){
	    // Get the relative location (X,Y) in browser view box
	    Double relativeLocationX = Double.parseDouble(((JavascriptExecutor)driver).executeScript(
	    		                        "var element = document.getElementById('" + elementId  + "');" +
	    		                        "var elementX = element.getBoundingClientRect().left;" + 
	     		                        "return elementX;").toString());
	    
	    Double relativeLocationY = Double.parseDouble(((JavascriptExecutor)driver).executeScript(
                                        "var element = document.getElementById('" + elementId  + "');" +
                                        "var elementY = element.getBoundingClientRect().top;" +  
                                        "return elementY;").toString());
	    
	    return new Point(relativeLocationX.intValue(), relativeLocationY.intValue());
	}
	
	/** Get Browser view area dimension */
	@Override
	public Dimension getBrowserViewBoxDimension(WebDriver driver){
		
		// The width of body including scroll bar.
		int innerWidth = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = window.innerWidth;" +
	     		                "return e;")).intValue(); 
		
		// The height of body including scroll bar.
		int innerHeight = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = window.innerHeight;" +
	     		                "return e;")).intValue();
		
		return new Dimension(innerWidth, innerHeight);
	}
	
	
	/** Get current documentElement ScrollTop value */
	protected int getScrollTop(WebDriver driver){
		
		//The Location of the scroll bar in the vertical orientation. 
		int scrollTop  = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                 "var e = document.documentElement.scrollTop;" +
	     		                 "return e;")).intValue();
		return scrollTop; 
	}
	
	/** Get current documentElement ScrollLeft value */
	protected int getScrollLeft(WebDriver driver){
		
		//The Location of the scroll bar in the vertical orientation. 
		// The Location of the scroll bar in the horizontal orientation. 
		int scrollLeft  = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                 "var e = document.documentElement.scrollLeft;" +
	     		                 "return e;")).intValue(); 
		return scrollLeft; 
	}
	
	
	/** Move window scroll to a specific position */
	protected void windowScrollTo(WebDriver driver, int scrollLeft, int scrollTop){
		
	    ((JavascriptExecutor)driver).executeScript("window.scrollTo(" + scrollLeft + "," + scrollTop+ ");");
	}

	/** Scroll window a offset based on current position */
	protected void windowScrollBy(WebDriver driver, int scrollOffsetLeft, int scrollOffsetTop){
		
	    ((JavascriptExecutor)driver).executeScript("window.scrollBy(" + scrollOffsetLeft + "," + scrollOffsetTop+ ");");
	}
	
	/** Scroll to view element */
	protected void scrollToElmentViewArea(WebDriver driver, String elementId){
		
		Point relativeLocation = getRelativeLocation(driver, elementId);
		
		int scrollLeft = getScrollLeft(driver);
		int scrollTop = getScrollTop(driver);
		
		Dimension browserViewDimension = getBrowserViewBoxDimension(driver);
		// The width of body including scroll bar.
		int innerWidth = browserViewDimension.width;
		// The height of body including scroll bar.
		int innerHeight = browserViewDimension.height;
		
		Dimension elementDimension = getElementDimension(driver, elementId);
		
	    // Scroll window if element is not visible
		if ((relativeLocation.x >= (innerWidth - elementDimension.width)) || (relativeLocation.x <= 0)){
			scrollLeft = scrollLeft + relativeLocation.x - 50;
		}
		
		if ((relativeLocation.y >= (innerHeight - elementDimension.height)) || (relativeLocation.y <= 0)){
			scrollTop = scrollTop + relativeLocation.y - 50;
		}
		
		windowScrollTo(driver, scrollLeft, scrollTop);
	}


	
}
