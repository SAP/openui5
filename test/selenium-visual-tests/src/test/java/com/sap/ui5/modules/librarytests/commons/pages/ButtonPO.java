package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;

public class ButtonPO extends PageBase {

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
	public void clickEnabledCB(WebDriver driver, IUserAction userAction) {

		userAction.mouseClick(driver, enabledCB.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
	}

	/** Click the check box "enabledCB" */
	public void clickVisibleCB(WebDriver driver, IUserAction userAction) {

		userAction.mouseClick(driver, visibleCB.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
	}

}
