package com.sap.ui5.selenium.action;


import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;


public class UserActionIE8 extends UserActionCommon{
	
	//IE8 browser has a margin
	protected int marginX = 2;
	protected int marginY = 2;

 
	/** API: Move Mouse to browser view area (1,1) */
	@Override
	public void mouseMoveToStartPoint(WebDriver driver){
		
		int scollBarWidth = getScollBarWidth(driver);
		Point p = getBrowserViewBoxLocation(driver);
		if (getRtl()) {
			// sap-ui-rtl=true
			p = new Point(p.x + marginX + scollBarWidth + 1, p.y + marginY + 1);
		} else {
			p = new Point(p.x + marginX + 1, p.y + marginY + 1);
		}
		mouseMove(p);
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
			elementScreenLocation = new Point(browserViewBoxLocation.x + relativeLocation.x + marginX + scollBarWidth, 
					                          browserViewBoxLocation.y + relativeLocation.y + marginY);
			
		}else{
			
			//sap-ui-rtl is false
			elementScreenLocation = new Point(browserViewBoxLocation.x + relativeLocation.x + marginX, 
					                          browserViewBoxLocation.y + relativeLocation.y + marginY);
		}

		return elementScreenLocation;	
	}
	
	/** Get Screen Bar width */
	public int getScollBarWidth(WebDriver driver){
		
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
	
	/** Get Browser view area dimension */
	@Override
	public Dimension getBrowserViewBoxDimension(WebDriver driver){
		
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
	
}
