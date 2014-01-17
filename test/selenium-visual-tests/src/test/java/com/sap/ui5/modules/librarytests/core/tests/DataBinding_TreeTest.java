package com.sap.ui5.modules.librarytests.core.tests;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.core.pages.DataBinding_TreePO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.TextField;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.util.UI5Timeout;

public class DataBinding_TreeTest extends TestBase {

	private DataBinding_TreePO page;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/core/visual/DataBinding_Tree.html";

	// 20 minutes are not enough for IE9 and IE10.
	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(25 * 60 * 1000);

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, DataBinding_TreePO.class);
		UI5PageFactory.initElements(driver, page);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	/** Verify changing data format of the data source. */
	@Test
	public void testDataFormat() {
		page.jsonArrayItem.click();
		verifyElement(page.databindingTreeID, "DatasourceFormat-JSONNestedInArray-" + page.databindingTreeID);
		page.xmlItem.click();
		verifyElement(page.databindingTreeID, "DatasourceFormat-XML-" + page.databindingTreeID);
		page.jsonItem.click();
		verifyElement(page.databindingTreeID, "DatasourceFormat-JSON-" + page.databindingTreeID);
	}

	/** Verify filter feature of the DataBinding Tree. */
	@Test
	public void testFilter() {
		TextField filterInput = page.filterInput;
		Button filterButton = page.filterBtn;

		/** Filter Feature */
		// Contains
		filterButton.click();
		verifyElement(page.databindingTreeID, "Filter-name-Contains-subsubitem3");

		// Click filter button a second time
		filterButton.click();
		verifyElement(page.databindingTreeID, "Click-FilterButton-SecondTime");

		// Filter contains result is no data
		filterInput.clearValue();
		filterInput.setValue("test");
		filterButton.click();
		verifyElement(page.databindingTreeID, "Filter-name-Constains-test-noData");

		// BT
		filterSendKeys("BT", "JSON_subitem1,JSON_subitem2");
		verifyElement(page.databindingTreeID, "Filter-name-BT-JSON_subitem1-JSON_subitem2");

		// EndsWith
		filterSendKeys("EndsWith", "1");
		verifyElement(page.databindingTreeID, "Filter-name-EndsWith-1");

		// StartsWith
		filterSendKeys("StartsWith", "JSON");
		verifyElement(page.databindingTreeID, "Filter-name-StartsWith-JSON");

		// EQ
		filterSendKeys("EQ", "JSON_subitem2");
		verifyElement(page.databindingTreeID, "Filter-name-EQ-JSON_subitem2");

		// GE
		filterSendKeys("GE", "JSON_subsubitem2");
		verifyElement(page.databindingTreeID, "Filter-name-GE-JSON_subsubitem2");

		// GT
		filterSendKeys("GT", "JSON_subsubitem2");
		verifyElement(page.databindingTreeID, "Filter-name-GT-JSON_subsubitem2");

		// LE
		filterSendKeys("LE", "JSON_subitem2");
		verifyElement(page.databindingTreeID, "Filter-name-LE-JSON_subitem2");

		// LT
		filterSendKeys("LT", "JSON_subitem2");
		verifyElement(page.databindingTreeID, "Filter-name-LT-JSON_subitem2");

		// NE
		filterSendKeys("NE", "JSON_subsubitem3");
		verifyElement(page.databindingTreeID, "Filter-name-NE-JSON_subsubitem3");
	}

	/** Verify keyboard actions on DataBinding Tree. */
	@Test
	public void testKeyboardActions() {
		Actions action = new Actions(driver);
		TextField filterInput = page.filterInput;

		action.sendKeys(Keys.TAB).perform();

		sendKeysByRtl(action);
		verifyElement(page.databindingTreeID, "Key-DatasourceFormat-JSONNestedInArray");

		sendKeysByRtl(action);
		verifyElement(page.databindingTreeID, "Key-DatasourceFormat-XML");

		sendKeysByRtl(action);
		verifyElement(page.databindingTreeID, "Key-DatasourceFormat-JSON");

		action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB, Keys.ENTER).perform();
		verifyElement(page.databindingTreeID, "Key-Filter-Contains-subsubitem3");

		action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		page.operatorInput.setValue("EndsWith");
		action.sendKeys(Keys.TAB).perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		filterInput.setValue("2");
		action.sendKeys(Keys.TAB).perform();
		verifyElement(page.databindingTreeID, "Key-Filter-EndsWith-2");
	}

	/** Send operator and string to filter input and click the filter button. */
	private void filterSendKeys(String filterOperator, String filterStr) {
		TextField filterInput = page.filterInput;
		TextField operatorInput = page.operatorInput;
		Button filterButton = page.filterBtn;

		filterButton.click();
		operatorInput.clearValue();
		operatorInput.setValue(filterOperator);
		filterInput.clearValue();
		filterInput.setValue(filterStr);
		filterButton.click();
	}

	private void sendKeysByRtl(Actions action) {
		if (isRtlTrue()) {
			action.sendKeys(Keys.LEFT).perform();
		} else {
			action.sendKeys(Keys.RIGHT).perform();

		}
	}
}