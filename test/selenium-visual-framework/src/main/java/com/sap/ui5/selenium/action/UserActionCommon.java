package com.sap.ui5.selenium.action;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import org.junit.Assert;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;



public abstract class UserActionCommon implements IUserAction {
	
	private Robot robot;
	private boolean rtl = false;
	
	/** Set sap-ui-rtl value */
	@Override
	public void setRtl(boolean rtl){
		this.rtl = rtl;
	}
	
	/** Get sap-ui-rtl value */
	@Override
	public boolean getRtl(){
		return this.rtl;	
	}

	/** API: Enable full Screen for browser */
	@Override
	public boolean enableBrowserFullScreen(WebDriver driver){
	
		WebElement element = driver.findElement(By.tagName("html"));
		element.sendKeys(Keys.F11);

		try {
			Thread.sleep(3000);
		} catch (InterruptedException e) {
			
			e.printStackTrace();
			return false;
		}
		return true;
	}

	/** API: Get Robot */
	@Override
	public Robot getRobot(){
		
		if (robot == null){
			
			try {
				robot = new Robot();
				robot.setAutoDelay(150);
				return robot;
				
			} catch (AWTException e) {
				
				e.printStackTrace();
				return null;
			}
		}else{
			
			return robot;
		}
	}
	
	
	
	
	/*  ======== Get element location and dimension =========  */
	/*=========================================================*/
	/** API: Get element dimension by JS */
	@Override
    public Dimension getElementDimension(WebDriver driver, String elementId){
		
		Long elementWidth = (Long) ((JavascriptExecutor)driver).executeScript(
		                           "var element = document.getElementById('" + elementId  + "');" +
		                           "return element.offsetWidth;"); 

    	Long elementHeight = (Long) ((JavascriptExecutor)driver).executeScript(
	                                "var element = document.getElementById('" + elementId  + "');" +
	                                "return element.offsetHeight;"); 
    	
    	Dimension elementDimension = new Dimension(elementWidth.intValue(), elementHeight.intValue());
    	return elementDimension;
	}
    
	/** API: Get element location */
	@Override
	public Point getElementLocation(WebDriver driver, String elementId){
		
		scrollToElmentViewArea(driver, elementId);
		
		Point browserViewBoxLocation = getBrowserViewBoxLocation(driver);
		Point relativeLocation = getRelativeLocation(driver, elementId);
		
		Point elementScreenLocation = new Point(browserViewBoxLocation.x + relativeLocation.x, 
				                                browserViewBoxLocation.y + relativeLocation.y);
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
 
		// The Location of the scroll bar in the horizontal orientation. 
		int scrollLeft  = ((Long) ((JavascriptExecutor)driver).executeScript(
	    		                 "var e = document.documentElement.scrollLeft;" +
	     		                 "return e;")).intValue(); 
		return scrollLeft; 
	}
	
	
	/** Move window scroll to a specific position */
	protected void windowScrollTo(WebDriver driver, int scrollLeft, int scrollTop){
		
	    ((JavascriptExecutor)driver).executeScript("window.scrollTo(" + scrollLeft + "," + scrollTop + ");");
	}

	/** Scroll window a offset based on current position */
	protected void windowScrollBy(WebDriver driver, int scrollOffsetLeft, int scrollOffsetTop){
		
	    ((JavascriptExecutor)driver).executeScript("window.scrollBy(" + scrollOffsetLeft + "," + scrollOffsetTop + ");");
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
	
	
	
	
	/*  ======== User Action for KeyBoard =========  */
	/*===============================================*/
    /** API: Press a key on keyboard after focus on the element The keycode is refered to KeyEvent class */
	@Override
    public void pressOneKey(int keycode){
    	Robot robot = getRobot();
    	
    	robot.keyPress(keycode);
    	robot.keyRelease(keycode);
    	
    }
	
    /** API: Press the two keys on keyboard at the same time after focus on the element */
	@Override
    public void pressTwoKeys(int firstKeyCode, int secondKeyCode){
    	
    	Robot robot = getRobot();
    	
    	robot.keyPress(firstKeyCode);
    	robot.keyPress(secondKeyCode);
    	
    	robot.keyRelease(firstKeyCode);
    	robot.keyRelease(secondKeyCode);
    	
    }
	
    /** API: Press the three keys on keyboard at the same time after focus on the element */
    @Override
    public void pressThreeKeys(int firstKeyCode, int secondKeyCode, int thirdKeyCode){
        
        Robot robot = getRobot();
        
        robot.keyPress(firstKeyCode);
        robot.keyPress(secondKeyCode);
        robot.keyPress(thirdKeyCode);
        
        robot.keyRelease(firstKeyCode);
        robot.keyRelease(secondKeyCode);
        robot.keyRelease(thirdKeyCode);
    }
    
    
    
    
    /*  ======== User Action for Mouse =========  */
    /*============================================*/
	/** API: Move Mouse to browser view area (1,1) */
	@Override
	public void mouseMoveToStartPoint(WebDriver driver){
		
		Point p = getBrowserViewBoxLocation(driver);
		p = new Point(p.x + 1, p.y + 1);
		mouseMove(p);
	}
	
	/** API: Move Mouse and click browser view area (1,1) */
    @Override
    public void mouseClickStartPoint(WebDriver driver){
        
        mouseMoveToStartPoint(driver);
        mouseClick();
    }
    
	/** Mouse move a specific location by Robot */
	@Override
    public void mouseMove(Point location){
    	
    	Robot robot = getRobot();
    	robot.mouseMove(location.x, location.y);
    }
    
	/** Mouse move an element center by Robot
	 *  If need move to a element, need use this method. */
	@Override
	public void mouseMove(WebDriver driver, String elementId){
		
	    Point p = getElementCenter(driver, elementId);
		mouseMove(p);
	}
	
	private Point getElementCenter(WebDriver driver, String elementId){
	    
        Point p = getElementLocation(driver, elementId);
        Dimension dimension = getElementDimension(driver, elementId);
        
        p.x = p.x + (dimension.width / 2);
        p.y = p.y + (dimension.height / 2);
        
        return p;
	}
	
	/** Mouse move and click a location by Robot */
	@Override
	public void mouseClick(Point location){

		mouseMove(location);
        mouseClick();
	}

	/** Mouse move and click an element by Robot */
	@Override
	public void mouseClick(WebDriver driver, String elementId){
	    
	    mouseMove(driver, elementId);
	    mouseClick();

	}
	
	private void mouseClick(){
	    Robot robot = getRobot();
	    
        robot.mousePress(KeyEvent.BUTTON1_MASK);
        robot.mouseRelease(KeyEvent.BUTTON1_MASK);
	}
	
	/** Mouse double click a location by Robot */
	@Override
    public void mouseDoubleClick(Point location){

        mouseMove(location);
        mouseDoubleClick();
    }

    /** Mouse double click an element by Robot */
    @Override
    public void mouseDoubleClick(WebDriver driver, String elementId){

        mouseMove(driver, elementId);
        mouseDoubleClick();
    }
    
    private void mouseDoubleClick(){
        
        Robot robot = getRobot();
        robot.mousePress(KeyEvent.BUTTON1_MASK);
        robot.mouseRelease(KeyEvent.BUTTON1_MASK);
        robot.delay(100); // interval time = (auto-delay) + 100;
        robot.mousePress(KeyEvent.BUTTON1_MASK);
        robot.mouseRelease(KeyEvent.BUTTON1_MASK);
    }
	
	/** Mouse click and hold on a location */
	@Override
	public void mouseClickAndHold(Point location){
		Robot robot = getRobot();
		mouseMove(location);
		robot.mousePress(KeyEvent.BUTTON1_MASK);
		
	}
	
	/** Mouse click and hold on an element */
	@Override
	public void mouseClickAndHold(WebDriver driver, String elementId){
		Robot robot = getRobot();
		mouseMove(driver, elementId);
	    robot.mousePress(KeyEvent.BUTTON1_MASK);
	}
	
	/** Mouse release for left button */
	@Override
	public void mouseRelease(){
		Robot robot = getRobot();
		robot.mouseRelease(KeyEvent.BUTTON1_MASK);
	}
	
	/** Mouse over by Robot */
	@Override
	public void mouseOver(WebDriver driver, String elementId, int durationMillisecond){
		
		mouseMove(driver, elementId);
		
		try {
			Thread.sleep(durationMillisecond);
		} catch (InterruptedException e) {
			e.printStackTrace();
			Assert.fail("Thread.sleep is failed for mouse over!");
		}
	}
	
	/** Drag and drop from a specific location to a target location */
	@Override
    public void dragAndDrop(WebDriver driver, Point soucreLocation, Point targetLocation){
        
        Robot robot = getRobot();
        mouseMove(soucreLocation);

        robot.mousePress(KeyEvent.BUTTON1_MASK);
        mouseMove(targetLocation);
        mouseRelease();
    }
	
    /** Drag and drop from a source element to a target element */
	@Override
    public void dragAndDrop(WebDriver driver, String soucreElementId, String targetElementId){
        
        Robot robot = getRobot();
        
        mouseMove(driver, soucreElementId);
        robot.mousePress(KeyEvent.BUTTON1_MASK);
        mouseMove(driver, targetElementId);
        mouseRelease();
    }
    
	/** Drag and drop from a source element to offset move */
	@Override
    public void dragAndDrop(WebDriver driver, String sourceElementId, int offsetX, int offsetY){
        
	    Point sourceLocation = getElementCenter(driver, sourceElementId);
	    Point targetLocation = new Point(sourceLocation.x + offsetX, 
	                                     sourceLocation.y + offsetY);
	    
	    
        dragAndDrop(driver, sourceLocation, targetLocation);
    }
    

}
