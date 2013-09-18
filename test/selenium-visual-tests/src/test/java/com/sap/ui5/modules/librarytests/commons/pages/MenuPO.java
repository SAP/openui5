package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.CommonBase;

public class MenuPO {

	public String oMenuEnabled = "oMenuEnabled";

	public String oMenuItemEnabled = "oMenuItemEnabled";

	public String oMenuItemVisible = "oMenuItemVisible";

	public String MenuMouseBtn = "MenuMouseBtn";

	public String MenuKeyboardBtn = "MenuKeyboardBtn";

	public String menu1 = "menu1";

	public String menuitem11Id = "menuitem11";

	public String menuitem11txtId = "menuitem11-txt";

	public String menuitem12Id = "menuitem12";

	public String menuitem12tfId = "menuitem12-tf";

	public String menuitem12txtId = "menuitem12-txt";

	public String menuitem12lblId = "menuitem12-lbl";

	public String menuitem13txtId = "menuitem13-txt";

	public String menuitem14Id = "menuitem14";

	public String menuitem14txtId = "menuitem14-txt";

	public String menu2Id = "menu2";

	public String menuitem22txtId = "menuitem22-txt";

	public String menuitem22lblId = "menuitem22-lbl";

	public String menuitem24txtId = "menuitem24-txt";

	public String menu3Id = "menu3";

	public String menuitem31Id = "menuitem31";

	public String menuitem31txtId = "menuitem31-txt";

	public String selectedMenuItemId = "selectedMenuItem";

	public int timeOutSeconds = 10;

	public int millisecond = 1000;

	@FindBy(xpath = "//div[starts-with(@id, 'menuitem1')][contains(@id, '-txt')]")
	public List<WebElement> menuItems;

	@FindBy(xpath = "//div[starts-with(@id, 'menuitem2')][contains(@id, '-txt')]")
	public List<WebElement> subMenu1Items;

	public void MouseOverElement(WebDriver driver, Actions action, String elementId, String menuId, boolean isVisible,
			CommonBase base) {
		action.moveToElement(driver.findElement(By.id(elementId))).perform();
		base.waitForElement(driver, isVisible, menuId, timeOutSeconds);
	}
	
	public void MouseOverElementByUserAction(WebDriver driver, IUserAction userAction, String elementId, String menuId, boolean isVisible,
			CommonBase base) {
		userAction.mouseMove(driver, elementId);
		base.waitForElement(driver, isVisible, menuId, timeOutSeconds);
	}

	public void clickElement(WebDriver driver, IUserAction userAction, String elementId, String menuId,
			boolean isVisible, CommonBase base) {
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		base.waitForElement(driver, isVisible, menuId, timeOutSeconds);
	}

	public void clickCheckboxAndButton(WebDriver driver, IUserAction userAction, String checkboxId, String buttonId,
			CommonBase base) {
		userAction.mouseClick(driver, checkboxId);
		userAction.mouseMoveToStartPoint(driver);
		clickElement(driver, userAction, buttonId, menu1, true, base);
	}

}
