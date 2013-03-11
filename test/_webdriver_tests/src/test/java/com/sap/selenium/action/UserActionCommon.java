package com.sap.selenium.action;

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
	private boolean rtl;
	
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
				robot.setAutoDelay(300);
				return robot;
				
			} catch (AWTException e) {
				
				e.printStackTrace();
				return null;
			}
		}else{
			
			return robot;
		}
	}
	
	/** API: Move Mouse to browser view area (1,1) */
	@Override
	public void moveMouseToStartPoint(WebDriver driver){
		
		Point p = getBrowserViewBoxLocation(driver);
		p = new Point(p.x + 1, p.y + 1);
		mouseClick(p);
	}
	
	
	/*==== Get location and dimension =====*/
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
	
    
	
	/*==== User Action for KeyBoard =====*/
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
    
	
    
    /*==== User Action for Mouse =====*/           
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
        p.x = p.x + 2;
        p.y = p.y + 2;
        
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
        robot.delay(0); // interval time = (auto-delay) + 0;
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
