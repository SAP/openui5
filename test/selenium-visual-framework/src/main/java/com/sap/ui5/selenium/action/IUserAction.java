package com.sap.ui5.selenium.action;

import java.awt.Robot;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;

public interface IUserAction {

    public void setRtl(boolean rtl);

    public boolean getRtl();

    public boolean enableBrowserFullScreen(WebDriver driver);

    public Robot getRobot();

    public void mouseMoveToStartPoint(WebDriver driver);
    
    public void mouseClickStartPoint(WebDriver driver);
    
    public void mouseMove(Point location);

    public void mouseMove(WebDriver driver, String elementId);

    public void mouseClick(Point location);

    public void mouseClick(WebDriver driver, String elementId);
    
    public void mouseDoubleClick(Point location);

    public void mouseDoubleClick(WebDriver driver, String elementId);

    public void mouseClickAndHold(Point location);

    public void mouseClickAndHold(WebDriver driver, String elementId);

    public void mouseRelease();

    public void mouseOver(WebDriver driver, String elementId, int durationMillisecond);

    public void dragAndDrop(WebDriver driver, Point soucreLocation, Point targetLocation);
    
    public void dragAndDrop(WebDriver driver, String soucreElementId, String targetElementId);
    
    public void dragAndDrop(WebDriver driver, String soucreElementId, int offsetX, int offsetY);
    
    public void pressOneKey(int keycode);

    public void pressTwoKeys(int firstKeyCode, int secondKeyCode);

    public void pressThreeKeys(int firstKeyCode, int secondKeyCode, int thirdKeyCode);

    public Dimension getElementDimension(WebDriver driver, String elementId);

    public Point getElementLocation(WebDriver driver, String elementId);

    public Point getBrowserViewBoxLocation(WebDriver driver);
    
    public Dimension getBrowserViewBoxDimension(WebDriver driver);

}
