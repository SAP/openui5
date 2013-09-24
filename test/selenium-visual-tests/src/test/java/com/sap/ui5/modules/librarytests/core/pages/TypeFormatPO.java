package com.sap.ui5.modules.librarytests.core.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class TypeFormatPO extends PageBase {

	@FindBy(id = "__link7")
	public WebElement en_US;

	@FindBy(id = "__link27")
	public WebElement zh_CN;

	@FindBy(id = "__link29")
	public WebElement xx_XX;

	@FindBy(id = "__link16")
	public WebElement ru_RU;

	@FindBy(id = "__link19")
	public WebElement he_IL;

	public String dateFormatID = "date";

	public String timeFormatID = "time";

	public String numberFormatID = "number";

	public String datetimeFormatID = "datetime";
}