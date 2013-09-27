package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebDriver;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;

public class TriStateCheckBoxPO extends PageBase {

	public String checkBoxPcb1Id = "pcb1";

	public String checkBoxCcb1Id = "ccb1";

	public String checkBoxCcb2Id = "ccb2";

	public String uiAreaId = "uiArea";

	public void clickElement(WebDriver driver, IUserAction userAction, String elementId) {
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
	}
}
