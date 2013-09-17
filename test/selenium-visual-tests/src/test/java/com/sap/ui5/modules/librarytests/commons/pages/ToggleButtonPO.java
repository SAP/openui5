package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;

public class ToggleButtonPO {
	@FindBy(id = "enabledCB-CB")
	private WebElement enabledCB;

	public String toggleButton1aId = "tglBtn1a";

	public String toggleButton1bId = "tglBtn1b";

	public String toggleButton1cId = "tglBtn1c";

	public String toggleButton2cId = "tglBtn2c";

	public String outputTargetId = "outputTarget";

	public void clickEnabledCB(WebDriver driver, IUserAction userAction) {
		userAction.mouseClick(driver, enabledCB.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
	}
}
