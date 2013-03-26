package com.sap.ui5.modules.commons.pages;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;

public class ButtonPO {
	
	@FindBy(id = "enabledCB-CB")
	private WebElement enabledCB;
	
	@FindBy(id = "visibleCB-CB")
	private WebElement visibleCB;
	
	@FindBy(id = "outputTarget")
	public WebElement outputTarget;
	
	@FindBy(id = "btn4")
	public WebElement elementIdBtn4;
	
	@FindBy(id = "btn5")
	public WebElement elementIdBtn5;
	
	@FindBy(className = "sapUiBtn")
	public List<WebElement> buttons; 
	
	
	/** Click the check box "enabledCB" */
	public void clickEnabledCB(WebDriver driver, IUserAction userAction){
		
		userAction.mouseClick(driver, enabledCB.getAttribute("id"));
	}
	
	/** Click the check box "enabledCB" */
	public void clickVisibleCB(WebDriver driver, IUserAction userAction){
		userAction.mouseClick(driver, visibleCB.getAttribute("id")); 
	}
	
	/** Mouse Over on button */
	public void mouseOverButton(WebDriver driver, WebElement e){
		
		Actions action = new Actions(driver);
		action.moveToElement(e).perform();
		Sleeper.sleepTight(500);
	}
		

}
