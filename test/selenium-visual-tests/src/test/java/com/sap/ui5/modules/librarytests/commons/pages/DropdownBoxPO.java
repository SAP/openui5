package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class DropdownBoxPO extends PageBase {

	@FindBy(id = "oBtnClearHistory")
	public WebElement oBtnClearHistory;

	@FindBy(id = "ddb1-icon")
	public WebElement ddb1Icon;

	@FindBy(id = "ddb2-icon")
	public WebElement ddb2Icon;

	@FindBy(id = "ddb2_shi")
	public WebElement ddb2Shi;

	@FindBy(id = "ddb3-icon")
	public WebElement ddb3Icon;

	@FindBy(id = "ddb3_shi")
	public WebElement ddb3Shi;

	public String myListId = "myList";

	public String outputTargetId = "outputTarget";

	public String ddb1It0 = "ddb1_it_0";

	public String ddb1It1 = "ddb1_it_1";

	public String ddb1It2 = "ddb1_it_2";

	public String ddb1It3 = "ddb1_it_3";

	public String ddb1It4 = "ddb1_it_4";

	public String ddb1It5 = "ddb1_it_5";

	public void clickItems(WebDriver driver, String... itemIds) {
		for (String id : itemIds) {
			driver.findElement(By.id(id)).click();
			ddb1Icon.click();
		}
	}
}
