package com.sap.ui5.modules.innersourcetests.innersource.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.innersourcetests.innersource.pages.Inbox_oDataPO;
import com.sap.ui5.selenium.common.TestBase;

public class Inbox_oDataTest extends TestBase {

	private Inbox_oDataPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/uiext/inbox/internal/InboxWithODataURLConfig.html";

	private int durationMillisecond = 1000;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, Inbox_oDataPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testoDataLoading() {
		oDataLoading();
		verifyElement(page.inboxId, page.inboxId + "-oData-Loading");
	}

	@Test
	public void testSwitchOfViews() {
		oDataLoading();

		mouseClick(page.streamViewButtonId);
		waitForReady(durationMillisecond * 5);
		page.setElementVisible(driver, page.timestampId, false);
		verifyElement(page.inboxId, page.inboxId + "-StreamView");

		mouseClick(page.tableViewButtonId);
		waitForReady(durationMillisecond * 5);
		page.setElementVisible(driver, page.timestampId, false);
		verifyElement(page.inboxId, page.inboxId + "-TableView");
	}

	@Test
	public void testFilteringData() {
		Actions action = new Actions(driver);
		oDataLoading();

		// Check filtering by using the FacetFilter.
		mouseClick(page.item2Id);
		mouseClick(page.item1Id);
		waitForReady(durationMillisecond * 5);
		verifyElement(page.inboxId, page.inboxId + "-ResetFilter");

		mouseClick(page.filterViewButtonId);
		waitForReady(durationMillisecond * 5);
		verifyElement(page.inboxId, page.inboxId + "-CloseFilter");

		// Check popup dialog and when click 'Manage Substitution Rules' Icon.
		mouseClick(page.settingsButtonId);
		userAction.mouseClickStartPoint(driver);
		verifyPage("OpenMySubstitutions");

		mouseClick(page.substitutingId);
		userAction.mouseClickStartPoint(driver);
		verifyPage("OpenIAmSubstituting");

		mouseClick(page.closeSubstitingId);
		page.setElementVisible(driver, page.timestampId, false);
		verifyElement(page.inboxId, page.inboxId + "-CloseSubstitutions");

		// Check filtering by using the search field.
		mouseClick(page.searchFieldId);
		action.sendKeys("Very High").perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
		waitForReady(durationMillisecond);
		page.setElementVisible(driver, page.timestampId, false);
		verifyElement(page.inboxId, page.inboxId + "-Search_Priority");

		mouseClick(page.clearSearchFieldId);
		userAction.mouseClickStartPoint(driver);
		page.setElementVisible(driver, page.timestampId, false);
		verifyElement(page.inboxId, page.inboxId + "-ResetSearch");

		mouseClick(page.tableRow13Id);
		page.setElementVisible(driver, page.timestampId, false);
		verifyElement(page.inboxId, page.inboxId + "-SelectReadyItem");
	}

	public void oDataLoading() {
		userAction.mouseClick(driver, page.loadDataButtonId);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(durationMillisecond * 10);
		page.setElementVisible(driver, page.timestampId, false);
		page.setElementVisible(driver, page.layoutId, false);
	}

	public void mouseClick(String elementId) {
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(durationMillisecond);
	}

}
