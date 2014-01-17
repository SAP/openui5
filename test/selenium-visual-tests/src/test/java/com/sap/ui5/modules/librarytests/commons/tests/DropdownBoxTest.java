package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.DropdownBoxPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.JsAction;

public class DropdownBoxTest extends TestBase {

	private DropdownBoxPO page;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/DropdownBox.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, DropdownBoxPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testHistoryFeature() {
		page.oBtnClearHistory.click();
		page.ddb1Icon.click();
		verifyElement(page.myListId, "ddb1-Initial");

		String[] itemIds = new String[] { page.ddb1It1, page.ddb1It3, page.ddb1It5 };

		// Click items to add history
		page.clickItems(driver, itemIds);
		page.ddb1Icon.click();
		verifyElement(page.outputTargetId, "ddb1-Item6Selected");
		page.ddb1Icon.click();
		verifyElement(page.myListId, "ddb1-History");

		itemIds = new String[] { page.ddb1It0, page.ddb1It2, page.ddb1It4 };

		// Click items to overwrite history
		page.clickItems(driver, itemIds);
		verifyElement(page.myListId, "ddb1-Overwrite-History");

		userAction.mouseClickStartPoint(driver);
		page.oBtnClearHistory.click();
		page.ddb1Icon.click();
		verifyElement(page.myListId, "ddb1-Clear-History");
	}

	@Test
	public void testSearchHelpFeature() {
		page.ddb2Icon.click();
		verifyElement(page.myListId, "myList-ddb2-SearchHelp");

		// page.ddb2Shi at invisible region on IE, Focus on element first.
		JsAction.focusOnElement(driver, page.ddb2Shi);

		page.ddb2Shi.click();
		userAction.mouseClickStartPoint(driver);
		verifyElement(page.outputTargetId, "outputTarget-ddb2-SearchHelp");

		page.ddb3Icon.click();
		verifyElement(page.myListId, "myList-ddb3-SearchHelp");

		page.ddb3Shi.click();
		userAction.mouseClickStartPoint(driver);
		verifyElement(page.outputTargetId, "outputTarget-ddb3-SearchHelp");
	}

}
