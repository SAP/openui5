package com.sap.selenium.tests.common;

import java.awt.event.KeyEvent;
import java.util.List;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;
import com.sap.selenium.common.TestBase;
import com.sap.selenium.pages.common.ButtonPO;
import com.sap.selenium.util.Constants;

public class ButtonTest extends TestBase{
	ButtonPO page; 
	
	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/QTP/Button.html";
	
	@Before
	public void setUp(){	
		
		page = PageFactory.initElements(driver, ButtonPO.class);
		driver.get(getFullUrl(targetUrl));
	    userAction.mouseClickStartPoint(driver);
	}	
	
	@After
	public void tearDown(){
		driver.quit();
	}
	
	
	/** Verify full Page UI and all element initial UI, Check enable and visible all elements */
	@Test
	public void testAllElements(){
	    
		//Test all initial elements
		verifyFullPageUI("full-initial");
		
		//Test all disabled elements
		page.clickEnabledCB(driver, userAction);
		verifyFullPageUI("full-disabled");
		
		//Test all enabled elements
		page.clickEnabledCB(driver, userAction);
		verifyFullPageUI("full-enabled");
		
		//Test all invisible elements
		page.clickVisibleCB(driver, userAction);
		verifyFullPageUI("full-invisible");
		
		//Test all visible elements
		page.clickVisibleCB(driver, userAction);
		verifyFullPageUI("full-visible");
	}
	
	/** Verify the mouse action on enabled elements: mouseover and click */
	@Test
	public void testMouseActionOnEnabledElements(){

		List<WebElement> buttons = page.buttons;
		
		//Test Mouse Over
		for (WebElement e : buttons){
			
			page.mouseOverButton(driver, e);
			
			String elementId = e.getAttribute("id");
			verifyElementUI(elementId, "MouseOver-" + elementId);
			
		}		
		
		//Test click
		for (WebElement e : buttons){
			
			e.click();
			
			String elementId = e.getAttribute("id");
			verifyElementUI(elementId, "Click-" + elementId); 
			verifyElementUI(page.outputTarget.getAttribute("id"), "Click-outputTarget-" + elementId); 
		}

	}
	
	/** Verify the mouse select for enable button elements */
	@Test
	public void testMouseSelectOnEnabledElements(){
		
		List<WebElement> buttons = page.buttons;
		
		//Test Mouse Select
		for (WebElement e : buttons){
			
			String elementId = e.getAttribute("id");
			
			userAction.mouseClickAndHold(driver, elementId);
			
			verifyElementUI(elementId, "MouseSelect-" + elementId);
			
			userAction.mouseRelease();
		}
		
	}
	
	/** Verify the mouse action on disabled elements: mouseover and click */
	@Test
	public void testMouseActionOnDisabledElements(){
		
		//Disable all elements
		page.clickEnabledCB(driver, userAction);
		
		List<WebElement> buttons = page.buttons;
		
		//Test Mouse Over
		for (WebElement e : buttons){
			
			page.mouseOverButton(driver, e);
			
			String elementId = e.getAttribute("id");
			verifyElementUI(elementId, "MouseOver-Disabled" + elementId);
			
		}		
		
		//Test click
		for (WebElement e : buttons){
			
			e.click();
			
			String elementId = e.getAttribute("id");
			verifyElementUI(elementId,  "Clicke-disabled" + elementId); 
			verifyElementUI(page.outputTarget.getAttribute("id"), "outputTarget-empty"); 

		}
	}
	
	
	/** Verify trigger button tooltip by mouseover */
	@Test
	public void testButtonTooltip(){
		
		String elementIdBtn4 = page.elementIdBtn4.getAttribute("id");
		String elementIdBtn5 = page.elementIdBtn5.getAttribute("id");
		Point locationBtn4 = userAction.getElementLocation(driver, elementIdBtn4);
		Point locationBtn5 = userAction.getElementLocation(driver, elementIdBtn5);
		
		userAction.mouseClickStartPoint(driver);
		
		if (isRtlTrue()){
			
			switch (getBrowserType()) {
			case Constants.IE:

				userAction.mouseOver(driver, elementIdBtn4, 3000);
				verifyCustomizedDimension(locationBtn4.x - 300, locationBtn4.y, 350, 60, "btn4-tooltip");
				
				userAction.mouseOver(driver, elementIdBtn5, 3000);
				verifyCustomizedDimension(locationBtn5.x - 300, locationBtn5.y, 350, 60, "btn5-tooltip");
				break;
				
			case Constants.FIREFOX:
				
				userAction.mouseOver(driver, elementIdBtn4, 3000);
				verifyCustomizedDimension(locationBtn5.x - 50, locationBtn5.y, 350, 60, "btn4-tooltip");
				
				userAction.mouseOver(driver, elementIdBtn5, 3000);
				verifyCustomizedDimension(elementIdBtn5, 300, 60, "btn5-tooltip");
				break;
				
			case Constants.CHROME:
				
				userAction.mouseOver(driver, elementIdBtn4, 3000);
				verifyCustomizedDimension(locationBtn4.x - 50, locationBtn4.y, 350, 60, "btn4-tooltip");
				
				userAction.mouseOver(driver, elementIdBtn5, 3000);
				verifyCustomizedDimension(elementIdBtn5, 300, 60, "btn5-tooltip");
				
				break;
				
			}
		}else{
			
			//Test tooltip on enabled button
			userAction.mouseOver(driver, elementIdBtn4, 3000);
			verifyCustomizedDimension(elementIdBtn4, 330, 60, "btn4-tooltip");
			
			userAction.mouseOver(driver, elementIdBtn5, 3000);
			verifyCustomizedDimension(elementIdBtn5, 300, 60, "btn5-tooltip");
			
			//Test tooltip on disabled button
			page.clickEnabledCB(driver, userAction);

			userAction.mouseOver(driver, elementIdBtn4, 3000);
			verifyCustomizedDimension(elementIdBtn4, 330, 60, "btn4-disabled-tooltip");
			
			userAction.mouseOver(driver, elementIdBtn5, 3000);
			verifyCustomizedDimension(elementIdBtn5, 300, 60, "btn5-disabled-tooltip");
		}

		
	}
	
	/** Verify the keyboard action like TAB, Enter, Space */
	@Test
	public void testKeyboardAction(){
		
		//Test Enter Key
		userAction.pressOneKey(KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		
		List<WebElement> buttons = page.buttons;
		
		for (WebElement e : buttons){
			userAction.pressOneKey(KeyEvent.VK_TAB);
			userAction.pressOneKey(KeyEvent.VK_ENTER);
			
			String elementId = e.getAttribute("id");
			verifyElementUI(elementId, "Enter-" + elementId); 
			verifyElementUI(page.outputTarget.getAttribute("id"), "Enter-outputTarget-" + elementId); 
		}	
		
		
		//Test Space Key
		userAction.mouseClickStartPoint(driver);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		
		for (WebElement e : buttons){
			userAction.pressOneKey(KeyEvent.VK_TAB);
			userAction.pressOneKey(KeyEvent.VK_ENTER);
			
			String elementId = e.getAttribute("id");
			verifyElementUI(elementId, "Space-" + elementId); 
			verifyElementUI(page.outputTarget.getAttribute("id"), "Space-outputTarget-" + elementId); 
		}
		
	}
	
	
	
}	
