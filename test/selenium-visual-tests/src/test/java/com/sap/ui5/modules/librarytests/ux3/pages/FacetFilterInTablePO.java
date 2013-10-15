package com.sap.ui5.modules.librarytests.ux3.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class FacetFilterInTablePO extends PageBase {

	@FindBy(id = "__item1")
	public WebElement brandAll;

	@FindBy(id = "__item2")
	public WebElement modelAll;

	@FindBy(id = "__item3")
	public WebElement typeAll;

	@FindBy(id = "__item0-ffl1-0")
	public WebElement item0f10;

	@FindBy(id = "__item0-ffl1-1")
	public WebElement item0f11;

	@FindBy(id = "__item0-ffl1-2")
	public WebElement item0f12;

	@FindBy(id = "__item0-ffl2-0")
	public WebElement item0f20;

	@FindBy(id = "__item0-ffl2-1")
	public WebElement item0f21;

	@FindBy(id = "__item0-ffl2-2")
	public WebElement item0f22;

	@FindBy(id = "__item0-ffl3-0")
	public WebElement item0f30;

	@FindBy(id = "__item0-ffl3-1")
	public WebElement item0f31;

	@FindBy(id = "__item0-ffl3-2")
	public WebElement item0f32;

	@FindBy(id = "__item0-ffl3-3")
	public WebElement item0f33;

	public String targetID = "target1";

	/** Check element's class attribute */
	public void checkAttribute(WebElement element) {

		String eleClass = element.getAttribute("class");
		if (!eleClass.contains("sapUiLbxISel")) {
			Sleeper.sleepTight(500);
		}
	}
}
