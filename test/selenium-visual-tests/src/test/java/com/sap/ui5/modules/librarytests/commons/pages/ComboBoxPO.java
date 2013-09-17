package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class ComboBoxPO {

	@FindBy(id = "myCombo")
	public WebElement myCombo;

	@FindBy(id = "myCombo-input")
	public WebElement myComboInput;

	@FindBy(id = "myCombo-icon")
	public WebElement myComboIcon;

	@FindBy(id = "myCombo7")
	public WebElement myCombo7;

	@FindBy(id = "myCombo7-icon")
	public WebElement myCombo7Icon;

	@FindBy(id = "cmb9-input")
	public WebElement cmb9Input;

	@FindBy(id = "cmb9-icon")
	public WebElement cmb9Icon;

	@FindBy(id = "cmb9-lb-I1")
	public WebElement cmb9LbI1;

	@FindBy(id = "myList")
	public WebElement myList;

	@FindBy(id = "myList-lb-I6")
	public WebElement myListIb6;

	@FindBy(css = "ul[id='myList-list'] > li")
	public List<WebElement> myListItems;

	public String cmb9LbId = "cmb9-lb";

	public String cmb9Id = "cmb9";

	public String myCombo6Id = "myCombo6";

	public String cmb6And7TargetId = "cmb6And7Target";

	public String myTextId = "myText";

	public void scroll(WebDriver driver, String elementId) {
		((JavascriptExecutor) driver).executeScript("var element = document.getElementById('" + elementId + "');"
				+ "element.scrollTop = 500;");
	}
}
