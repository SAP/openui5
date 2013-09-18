package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;

public class CheckBoxPO {
	@FindBy(id = "chkBox3")
	public WebElement checkBox3;

	@FindBy(id = "chkBox6")
	public WebElement checkBox6;

	@FindBy(id = "chkBox6-CB")
	public WebElement checkBox6CB;

	@FindBy(id = "chkBox12")
	public WebElement checkBox12;

	public String chkBox1CBId = "chkBox1-CB";

	public String ckdStateId = "ckdState";

	public String targetArea3Id = "target3";

	public String targetArea6Id = "target6";

	public String targetArea12Id = "target12";

	public void dragDropOnCheckBox3(WebDriver driver, IUserAction userAction) {
		Point point = userAction.getElementLocation(driver, checkBox3.getAttribute("id"));
		int startPointX = point.x + 50;
		int startPointY = point.y + 8;
		int endPointX = point.x + 70;
		int endPointY = point.y + 12;
		if (userAction.getRtl()) {
			startPointX = point.x + checkBox3.getSize().width - 40;
			endPointX = point.x + checkBox3.getSize().width - 60;
		}
		// Drag and drop
		Point startPoint = new Point(startPointX, startPointY);
		Point endPoint = new Point(endPointX, endPointY);
		userAction.dragAndDrop(driver, startPoint, endPoint);
	}

	public void pressOneKey(IUserAction userAction, int key, int count) {
		for (int i = 0; i < count; i++) {
			userAction.pressOneKey(key);
		}
	}
}
