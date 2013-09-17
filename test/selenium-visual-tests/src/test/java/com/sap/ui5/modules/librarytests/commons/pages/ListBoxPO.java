package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.CommonBase;

public class ListBoxPO {

	@FindBy(className = "sapUiLbx")
	public List<WebElement> listBoxes;

	@FindBy(id = "listBox1-I0")
	public WebElement listBox1Item1;

	@FindBy(id = "listBox5")
	public WebElement listBox5;

	@FindBy(id = "listBox8")
	public WebElement listBox8;

	@FindBy(id = "listBox8-I0")
	public WebElement listBox8Item1;

	@FindBy(id = "listBox8-I1")
	public WebElement listBox8Item2;

	@FindBy(id = "listBox8-I2")
	public WebElement listBox8Item3;

	public String selectionId = "selection";

	public int waitMilliseconds = 1000;

	public void allElementsScollTop(WebDriver driver, CommonBase base) {
		base.waitForReady(waitMilliseconds);
		for (WebElement e : listBoxes) {
			String elementId = e.getAttribute("id");

			base.waitForReady(waitMilliseconds);
			((JavascriptExecutor) driver).executeScript("var element = document.getElementById('" + elementId + "');"
					+ "element.scrollTop = 0;");
		}
	}

	public void pressOneKey(IUserAction userAction, int key, int count) {
		for (int i = 0; i < count; i++) {
			userAction.pressOneKey(key);
		}
	}
}
