package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;

public class LabelPO extends PageBase {

	@FindBy(id = "label5")
	public WebElement label5;

	public String targetLabeledForId = "targetLabeledFor";

	public void dragDrop(WebDriver driver, IUserAction userAction, WebElement element) {
		String elementId = element.getAttribute("id");
		Point point = userAction.getElementLocation(driver, elementId);
		int startPointX = point.x + (int) (element.getSize().width * 0.5);
		int endPointX = point.x + (int) (element.getSize().width * 0.75);
		if (userAction.getRtl()) {
			int tempPointX = startPointX;
			startPointX = endPointX;
			endPointX = tempPointX;
		}
		Point startPoint = new Point(startPointX, point.y + 8);
		Point endPoint = new Point(endPointX, point.y + 12);
		userAction.dragAndDrop(driver, startPoint, endPoint);
	}
}
