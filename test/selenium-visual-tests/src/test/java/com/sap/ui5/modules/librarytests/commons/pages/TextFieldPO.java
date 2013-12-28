package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.common.TestBase;

public class TextFieldPO extends PageBase {
	@FindBy(className = "sapUiTf")
	public List<WebElement> textFields;

	public String textField1Id = "textField1";

	public String textField2Id = "textField2";

	public String textField3Id = "textField3";

	public String textField4Id = "textField4";

	public String textField7Id = "textField7";

	public String lvTextFieldId = "liveChangeTextField";

	public int millisecond = 1000;

	public void showTooltip(WebDriver driver, IUserAction userAction, String elementId, TestBase base) {
		if (base.browserIsFirefox()) {
			userAction.mouseOver(driver, elementId, millisecond);
			userAction.mouseMoveToStartPoint(driver);
			userAction.mouseOver(driver, elementId, millisecond);
		} else {
			Point p = userAction.getElementLocation(driver, elementId);
			p.x = p.x + 1;
			p.y = p.y + 1;
			userAction.mouseMove(p);
		}
	}
}
