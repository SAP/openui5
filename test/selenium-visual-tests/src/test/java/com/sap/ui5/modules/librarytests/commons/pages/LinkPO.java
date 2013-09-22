package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class LinkPO {

	@FindBy(className = "sapUiLnk")
	public List<WebElement> enabledLinks;

	@FindBy(id = "link5")
	public WebElement link5;

	@FindBy(id = "link7")
	public WebElement link7;

	public String enabledRowId = "enabled_row";

	public String visibleRowId = "visible_row";

	public String link2Id = "link2";

	public String link2TargetAreaId = "link2-target";
}
