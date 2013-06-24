package com.sap.ui5.modules.libarytests.commons.tests;

import java.awt.event.KeyEvent;
import java.util.List;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;
import com.sap.ui5.modules.libarytests.commons.pages.ButtonPO;
import com.sap.ui5.selenium.common.TestBase;

public class ButtonTest extends TestBase{
	ButtonPO page; 
	
	
	private String targetUrl = "/test-resources/sap/ui/commons/QTP/Button.html";
	
	@Before
	public void setUp(){	
		logTestStart();
		page = PageFactory.initElements(driver, ButtonPO.class);
		driver.get(getFullUrl(targetUrl));
	    userAction.mouseClickStartPoint(driver);
	}	
	
	@After
	public void tearDown(){
		driver.quit();
		logTestEnd();
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
	
	
	@Test
	public void testMouseOverEnabledElements(){
		
		//Test Mouse Over
		for (WebElement e : page.buttons){
			
			String elementId = e.getAttribute("id");
			userAction.mouseOver(driver, elementId, 800);
			
			verifyElementUI(elementId, "MouseOver-" + elementId);
		}			
	}
	
	@Test
	public void testMouseClickEnabledElements(){

		Actions action = new Actions(driver);
		action.sendKeys(Keys.TAB, Keys.TAB).perform();
		//Test click
		for (WebElement e : page.buttons){
			
			action.sendKeys(Keys.TAB).perform();
			String elementId = e.getAttribute("id");
			userAction.mouseClick(driver, elementId);
			userAction.mouseMoveToStartPoint(driver);

			verifyElementUI(elementId, "Click-" + elementId); 
			verifyElementUI(page.outputTarget.getAttribute("id"), "Click-outputTarget-" + elementId); 
		}
	}
	
	/** Verify the mouse select for enable button elements */
	@Test
	public void testMouseSelectEnabledElements(){
		//Avoid unstable dashed frame on Firfox testing.
		//Use keyboard to focus on the button then click.
		Actions action = new Actions(driver);
		action.sendKeys(Keys.TAB, Keys.TAB).perform();
		//Test Mouse Select
		for (WebElement e : page.buttons){
			
			action.sendKeys(Keys.TAB).perform();
			String elementId = e.getAttribute("id");
			
			userAction.mouseClickAndHold(driver, elementId);
			verifyElementUI(elementId, "MouseSelect-" + elementId);
			userAction.mouseRelease();
		}
		
	}
	
	/** Verify the mouse action on disabled elements: mouseover and click */
	@Test
	public void testMouseActionDisabledElements(){
		
		//Disable all elements
		page.clickEnabledCB(driver, userAction);
		
		WebElement e = page.buttons.get(0);
		String elementId = e.getAttribute("id");
		
		//Test Mouse Over
		userAction.mouseOver(driver, elementId, 800);
		verifyElementUI(elementId, "MouseOver-Disabled" + elementId);
		
		//Test click
		e.click();
		verifyElementUI(elementId,  "Clicke-disabled" + elementId); 
		verifyElementUI(page.outputTarget.getAttribute("id"), "outputTarget-empty"); 
	}
	
	
	/** Verify trigger button tooltip by mouseover */
	@Test
	public void testButtonTooltip(){
		
		String elementIdBtn4 = page.elementIdBtn4.getAttribute("id");
		String elementIdBtn5 = page.elementIdBtn5.getAttribute("id");
		
		//Handler situation(Firefox and RTL=true)
		userAction.mouseOver(driver, elementIdBtn4, 1000);
		userAction.mouseMoveToStartPoint(driver);
		
		//Test tooltip on enabled button
		userAction.mouseOver(driver, elementIdBtn4, 3000);
		verifyBrowserViewBox("btn4-tooltip");
		
		userAction.mouseOver(driver, elementIdBtn5, 3000);
		verifyBrowserViewBox("btn5-tooltip");
		
		//Test tooltip on disabled button
		page.clickEnabledCB(driver, userAction);

		userAction.mouseOver(driver, elementIdBtn4, 3000);
		verifyBrowserViewBox("btn4-disabled-tooltip");
		
		userAction.mouseOver(driver, elementIdBtn5, 3000);
		verifyBrowserViewBox("btn5-disabled-tooltip");
		
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
