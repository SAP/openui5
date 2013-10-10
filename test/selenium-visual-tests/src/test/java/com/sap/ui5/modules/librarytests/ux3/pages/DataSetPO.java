package com.sap.ui5.modules.librarytests.ux3.pages;

import java.awt.event.KeyEvent;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.CheckBox;

public class DataSetPO extends PageBase {

	@FindBy(id = "cbToolbar")
	public CheckBox showToolbar;

	@FindBy(id = "cbFilter")
	public CheckBox showFilter;

	@FindBy(id = "cbSearchField")
	public CheckBox showSearchField;

	@FindBy(id = "cbMultiSelect")
	public CheckBox showMultipleSelect;

	@FindBy(id = "dsId-view-__view0")
	public WebElement thumbViewBtn;

	@FindBy(id = "dsId-view-__view1")
	public WebElement listViewBtn;

	@FindBy(id = "dsId-view-__view2")
	public WebElement cardViewBtn;

	@FindBy(id = "__item0-dsId-0")
	public WebElement sapAGItem;

	@FindBy(id = "__item0-dsId-2")
	public WebElement ibmCorpItem;

	@FindBy(id = "__item2")
	public WebElement companyFilterAll;

	@FindBy(id = "__item1-ffl1-0")
	public WebElement item1f10;

	@FindBy(id = "__item3-ffl2-1")
	public WebElement item3f21;

	@FindBy(id = "__item1-ffl1-1")
	public WebElement item1f11;

	@FindBy(id = "__item1-ffl1-2")
	public WebElement item1f12;

	@FindBy(id = "__item4")
	public WebElement headquarterAll;

	@FindBy(id = "dsId-searchValue-tf-input")
	public WebElement searchInput;

	public String listViewId = "__view1";

	public String cardViewId = "__view2";

	public String dataSetId = "content";

	public String filterItemId = "dsId-filter";

	public String dataSetItemsId = "dsId-items";

	public String toolbarId = "__toolbar0";

	public String filterId = "myFacetFilter";

	public String searchId = "dsId-searchValue";

	public void checkAttribute(WebElement element) {

		String eleClass = element.getAttribute("class");
		if (!eleClass.contains("sapUiLbxISel")) {
			Sleeper.sleepTight(500);
		}
	}

	public void sendKeysToSearch(String searchStr, IUserAction userAction) {

		searchInput.click();
		searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		searchInput.sendKeys(searchStr);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		searchInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
	}
}