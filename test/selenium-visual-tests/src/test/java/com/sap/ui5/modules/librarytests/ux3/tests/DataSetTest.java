package com.sap.ui5.modules.librarytests.ux3.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.DataSetPO;
import com.sap.ui5.selenium.common.TestBase;

public class DataSetTest extends TestBase {

	private DataSetPO page;
	private int millisecond = 1000;
	private int timeOutSeconds = 10;
	private String targetUrl = "/test-resources/sap/ui/ux3/visual/DataSet.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, DataSetPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		waitForReady(millisecond);
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testListViews() {
		String sapAGItemId = page.sapAGItem.getAttribute("id");
		String ibmCorpItemId = page.ibmCorpItem.getAttribute("id");

		// Default View
		userAction.mouseOver(driver, sapAGItemId, millisecond);
		verifyElementUI(page.dataSetItemsId, "MouseOver-DefaultView-" + page.sapAGItem.getText());

		userAction.mouseClick(driver, ibmCorpItemId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.dataSetItemsId, "MouseClick-DefaultView-" + page.ibmCorpItem.getText());

		// List View
		userAction.mouseClick(driver, page.listViewBtn.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, true, page.listViewId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "ListView");

		userAction.mouseOver(driver, sapAGItemId, millisecond);
		verifyElementUI(page.dataSetId, "MouseOver-ListView-" + sapAGItemId);

		userAction.mouseClick(driver, ibmCorpItemId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.dataSetId, "MouseClick-ListView-" + ibmCorpItemId);

		// Bussiness Card View
		userAction.mouseClick(driver, page.cardViewBtn.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, false, page.listViewId, timeOutSeconds);
		this.waitForElement(driver, true, page.cardViewId, timeOutSeconds);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.dataSetId, "BussinessCardView");

		userAction.mouseOver(driver, sapAGItemId, millisecond);
		verifyElementUI(page.dataSetId, "MouseOver-CardView-" + page.sapAGItem.getAttribute("id"));

		userAction.mouseClick(driver, ibmCorpItemId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.dataSetId, "MouseClick-CardView-" + page.ibmCorpItem.getAttribute("id"));
	}

	@Test
	public void testFilterFeature() {
		waitForReady(millisecond);

		// Default view filtering
		userAction.mouseClick(driver, page.showFilterCh.getAttribute("id"));
		this.waitForElement(driver, true, page.filterId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "DefaultView-ShowToolbar-Filter");

		userAction.mouseClick(driver, page.item1f10.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		page.checkAttribute(page.item1f10);
		verifyElementUI(page.dataSetId, "DefaultView-Filter-Company-SAPAG");

		userAction.mouseClick(driver, page.companyFilterAll.getAttribute("id"));
		userAction.mouseClick(driver, page.item3f21.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		page.checkAttribute(page.item3f21);
		verifyElementUI(page.dataSetId, "DefaultView-Filter-Headquarter");

		// List view filtering
		userAction.mouseClick(driver, page.headquarterAll.getAttribute("id"));
		userAction.mouseClick(driver, page.listViewBtn.getAttribute("id"));
		verifyElementUI(page.dataSetId, "ListView-ShowToolbar-Filter");

		userAction.mouseClick(driver, page.item1f11.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		page.checkAttribute(page.item1f11);
		verifyElementUI(page.dataSetId, "ListView-Filter-Company-OracleCorp");

		userAction.mouseClick(driver, page.companyFilterAll.getAttribute("id"));
		userAction.mouseClick(driver, page.item3f21.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		page.checkAttribute(page.item3f21);
		verifyElementUI(page.dataSetId, "ListView-Filter-Headquarter");

		// Bussiness Card view filtering
		userAction.mouseClick(driver, page.headquarterAll.getAttribute("id"));
		userAction.mouseClick(driver, page.cardViewBtn.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.dataSetId, "CardView-ShowToolbar-Filter");

		userAction.mouseClick(driver, page.item1f11.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		page.checkAttribute(page.item1f11);
		verifyElementUI(page.dataSetId, "CardView-Filter-Company-OracleCorp");

		userAction.mouseClick(driver, page.companyFilterAll.getAttribute("id"));
		userAction.mouseClick(driver, page.item3f21.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		page.checkAttribute(page.item3f21);
		verifyElementUI(page.dataSetId, "CardView-Filter-Headquarter");

		userAction.mouseClick(driver, page.headquarterAll.getAttribute("id"));

		// Multiple select
		userAction.mouseClick(driver, page.item1f10.getAttribute("id"));
		userAction.getRobot().keyPress(KeyEvent.VK_CONTROL);
		userAction.mouseClick(driver, page.item1f12.getAttribute("id"));
		userAction.getRobot().keyRelease(KeyEvent.VK_CONTROL);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.dataSetId, "CardView-MultiFilter");

		//Reset Filter
		userAction.mouseClick(driver, page.companyFilterAll.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		page.checkAttribute(page.companyFilterAll);
		verifyElementUI(page.dataSetId, "Reset-filter");

		//Hide filter
		userAction.mouseClick(driver, page.showFilterCh.getAttribute("id"));
		this.waitForElement(driver, false, page.filterId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "Hide-Filter");
	}

	@Test
	public void testSearchFeature() {

		userAction.mouseClick(driver, page.showSearchFieldCh.getAttribute("id"));
		this.waitForElement(driver, true, page.searchId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "DefaultView-SearchField");
		page.sendkeysToSearch("SAP");
		verifyElementUI(page.dataSetId, "DefaultView-Search-SAP");

		userAction.mouseClick(driver, page.listViewBtn.getAttribute("id"));
		page.sendkeysToSearch("IBM");
		verifyElementUI(page.dataSetId, "ListView-Search-IBM");

		// Search with nothing
		page.sendkeysToSearch("USA");
		verifyElementUI(page.dataSetId, "CardView-Search-nothing");

		// Hide SearchField
		userAction.mouseClick(driver, page.showSearchFieldCh.getAttribute("id"));
		this.waitForElement(driver, false, page.searchId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "Hide-SearchField");
	}

	@Test
	public void testHideShowToolbar() {

		userAction.mouseClick(driver, page.showToolbarCh.getAttribute("id"));
		this.waitForElement(driver, false, page.toolbarId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "Hide-Toolbar");

		userAction.mouseClick(driver, page.showToolbarCh.getAttribute("id"));
		this.waitForElement(driver, true, page.toolbarId, timeOutSeconds);
		verifyElementUI(page.dataSetId, "Show-Tooltip");
	}
}
