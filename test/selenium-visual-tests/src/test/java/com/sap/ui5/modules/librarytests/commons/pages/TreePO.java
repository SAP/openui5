package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;

public class TreePO {

	@FindBy(id = "tree1-node1")
	public WebElement tree1Node1;

	@FindBy(id = "tree1-node11")
	public WebElement tree1Node11;

	@FindBy(id = "tree1-node111")
	public WebElement tree1Node111;

	@FindBy(id = "tree1-node2")
	public WebElement tree1Node2;

	@FindBy(id = "tree1-node211")
	public WebElement tree1Node211;

	@FindBy(id = "tree1-CollapseAll")
	public WebElement tree1CollapseAll;

	@FindBy(id = "tree1-ExpandAll")
	public WebElement tree1ExpandAll;

	public String tree1Id = "tree1";

	public String tree1ContentId = "tree1-TreeCont";

	public String tree1Node121Id = "tree1-node121";

	public String notificationAreaId = "notificationArea";

	public void clickNodeIcon(WebDriver driver, IUserAction userAction, WebElement node, boolean isRtl) {
		Point target = userAction.getElementLocation(driver, node.getAttribute("id"));
		if (isRtl) {
			userAction.mouseClick(new Point(target.x + node.getSize().width - 5, target.y + 11));
		} else {
			userAction.mouseClick(new Point(target.x + 5, target.y + 11));
		}
		userAction.mouseMoveToStartPoint(driver);
	}

}
