package com.sap.ui5.modules.librarytests.core.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.TextField;

public class DataBinding_TreePO extends PageBase {

	@FindBy(id = "rgbDataFormat-0-label")
	public WebElement jsonItem;

	@FindBy(id = "rgbDataFormat-1-label")
	public WebElement jsonArrayItem;

	@FindBy(id = "rgbDataFormat-2-label")
	public WebElement xmlItem;

	@FindBy(id = "filterBtn")
	public Button filterBtn;

	@FindBy(id = "__field1")
	public TextField operatorInput;

	@FindBy(id = "__field2")
	public TextField filterInput;

	public String databindingTreeID = "databindingTree";
}