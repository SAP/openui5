package com.sap.selenium.action;


import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;


public class UserActionIE extends UserActionCommon{
	
	//IE browser has a margin
	private final int marginX = 2;
	private final int marginY = 2;

 
	/** API: Move Mouse to browser view area (1,1) */
	@Override
	public void moveMouseToStartPoint(WebDriver driver){
		
		Point p = getBrowserViewBoxLocation(driver);
		p = new Point(p.x + marginX + 1, p.y + marginY +1);
		mouseClick(p);
	}
	
	
	/** API: Get element location in screen */
	@Override
	public Point getElementLocation(WebDriver driver, String elementId){
		
		scrollToElmentViewArea(driver, elementId);
		
		Point browserViewBoxLocation = getBrowserViewBoxLocation(driver);
		Point relativeLocation = getRelativeLocation(driver, elementId);
		int scollBarWidth = getScollBarWidth(driver);
		
		Point elementScreenLocation;
		if (getRtl()){
			
			// sap-ui-rtl is true
			elementScreenLocation = new Point(browserViewBoxLocation.x + relativeLocation.x + marginX + scollBarWidth, browserViewBoxLocation.y + relativeLocation.y + marginY);
			
		}else{
			
			//sap-ui-rtl is false
			elementScreenLocation = new Point(browserViewBoxLocation.x + relativeLocation.x + marginX, browserViewBoxLocation.y + relativeLocation.y + marginY);
		}

		return elementScreenLocation;	
	}
	
	/** Get Screen Bar width */
	protected int getScollBarWidth(WebDriver driver){
		

		//Browser outer width
		int outerWidth = ((Long) ((JavascriptExecutor)driver).executeScript(
                                 "var e = document.documentElement.offsetWidth;" +
                                 "return e;")).intValue(); 
		
		//Browser inner width
		int innerWidth = ((Long) ((JavascriptExecutor)driver).executeScript(
                                  "var e = document.documentElement.clientWidth;" +
                                  "return e;")).intValue(); 
		
		//Browser edge
		int edge = ((Long) ((JavascriptExecutor)driver).executeScript(
                            "var e = document.documentElement.clientLeft;" +
                            "return e;")).intValue(); 


		int scrollBarWidth = outerWidth - innerWidth- 2 * edge - 2 * marginX;
		return scrollBarWidth;
	}
	
	/** Get browser view box location,  browser view box to Screen 0,0 */
	@Override
	public Point getBrowserViewBoxLocation(WebDriver driver){
		
		// The Location X of the browser view area in the screen
		int BrowserViewBoxLocationX = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                 "var e = window.screenLeft;" +
	     		                 "return e;")).intValue(); 
		
		// The Location Y of the browser view area in the screen.
		int BrowserViewBoxLocationY = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = window.screenTop;" +
	     		                "return e;")).intValue(); 
		
		return new Point(BrowserViewBoxLocationX, BrowserViewBoxLocationY);
	}
	
	/** Get relative location of element in browser view box */
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
	protected Dimension getBrowserViewDimension(WebDriver driver){
		
		// The width of body including scroll bar.
		int innerWidth = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e = document.documentElement.clientWidth;" +
	     		                "return e;")).intValue(); 
		
		// The height of body including scroll bar.
		int innerHeight = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                "var e =  document.documentElement.clientHeight;" +
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
		
		Dimension browserViewDimension = getBrowserViewDimension(driver);
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
