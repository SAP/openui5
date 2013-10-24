package com.sap.ui5.modules.librarytests.ux3.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.ThingInspectorInShellPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.util.Constants;

public class ThingInspectorInShellTest extends TestBase {

	private ThingInspectorInShellPO page;

	private final int timeOutSeconds = 10;

	private final int millisecond = 1000;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/ThingInspectorInShell.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ThingInspectorInShellPO.class);
		UI5PageFactory.initElements(driver, page);

		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	/** Verify Standard ThingInspector */
	@Test
	public void testStandardActions() {

		// Check standard ThingInspector
		page.standardTIBtn.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyBrowserViewBox("StandardTI-Opened");

		// Disabled actions
		page.updateCheckbox.toggle();
		page.followCheckbox.toggle();
		page.favoriteCheckbox.toggle();
		page.flagCheckbox.toggle();
		userAction.mouseMove(driver, page.flagCheckbox.getId());
		waitForReady(millisecond);
		verifyBrowserViewBox("StandardTI-AllActions-Disabled");

		// Enable tools
		page.updateCheckbox.toggle();
		this.waitForElement(driver, true, page.actionBarUpdate.getAttribute("id"), timeOutSeconds);
		page.followCheckbox.toggle();
		this.waitForElement(driver, true, page.actionBarFollowID, timeOutSeconds);
		page.favoriteCheckbox.toggle();
		this.waitForElement(driver, true, page.actionBarFavoriteID, timeOutSeconds);
		page.flagCheckbox.toggle();
		this.waitForElement(driver, true, page.actionBarFlagID, timeOutSeconds);
		userAction.mouseMove(driver, page.flagCheckbox.getId());
		verifyBrowserViewBox("StandardTI-AllActions-Enabled");

		// Check open and closed of update tool
		page.actionBarUpdate.click();
		this.waitForElement(driver, true, page.updatePopupID, timeOutSeconds);
		page.updateInput.sendKeys("test");
		page.updateInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		verifyElementUI(page.feederID, "StandarTI-Update-Opened");

		page.actionBarUpdate.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyBrowserViewBox("StandarTI-Update-Closed");

		// Changing status of follow
		page.thingInspector.follow();
		waitForReady(500);
		verifyBrowserViewBox("StandardTI-Follow-Start");

		page.thingInspector.pauseFollow();
		waitForReady(500);
		verifyBrowserViewBox("StandardTI-Follow-Hold");

		page.thingInspector.continueFollow();
		waitForReady(500);
		verifyBrowserViewBox("StandardTI-Follow-Continue");

		page.thingInspector.stopFollow();
		verifyBrowserViewBox("StandardTI-Follow-Stop");

		// Changing status of favorite
		page.thingInspector.favorite();
		verifyBrowserViewBox("StandardTI-markAsFavorite");

		page.thingInspector.favorite();
		verifyBrowserViewBox("StandardTI-unmarkAsFavorite");

		// Changing status of flag
		page.thingInspector.flag();
		verifyBrowserViewBox("StandardTI-Flag");

		page.thingInspector.flag();
		verifyBrowserViewBox("StandardTI-unflag");
	}

	/** Verify Navigation Bar */
	@Test
	public void testNavigationBar() {

		// Navigate to the last item on the navigation bar 
		page.standardTIBtn.click();
		page.thingInspector.selectFacet(page.accountTeamID);
		userAction.mouseMove(driver, page.accountTeamID);
		verifyElementUI(page.thingViewerID, "Navigate-To-AccountTeam");

		// Open ThingInspector in new window
		userAction.mouseOver(driver, page.openNew.getAttribute("id"), 500);
		verifyElementUI(page.openNew.getAttribute("id"), "MouseOver-StandTI-OpenNew");

		page.openNew.click();
		this.waitForElement(driver, true, page.openNewID, timeOutSeconds);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-OpenNewWindow");
		page.openNewOKBtn.click();

		// Close ThingInspector
		userAction.mouseOver(driver, page.standardClose.getAttribute("id"), 500);
		verifyElementUI(page.standardClose.getAttribute("id"), "MouseOver-StandTI-Close");

		page.standardClose.click();
		waitForReady(2000);
		verifyBrowserViewBox("StandTI-Closed");
	}

	/** Verify ThingGroup resizing and closing by Space button.*/
	@Test
	public void testThingGroupResized() {
		Actions action = new Actions(driver);
		int loopNum = 0;

		// Check the layout of all elements will be changed when resizing the window.
		page.modifiedTIWithOpen.click();
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-with-Open-Opened");

		driver.manage().window().setPosition(new Point(10, 10));
		driver.manage().window().setSize(new Dimension(1250, 550));
		waitForReady(1500);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingGroupsResized");

		driver.manage().window().setPosition(new Point(100, 100));
		driver.manage().window().setSize(new Dimension(900, 700));
		waitForReady(1500);

		// Closing it by Space Key
		if (getBrowserType() == Constants.IE8 || getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			loopNum = 6;
		} else {
			loopNum = 4;
		}

		for (int i = 0; i < loopNum; i++) {
			action.sendKeys(Keys.TAB).perform();
		}

		action.sendKeys(Keys.SPACE).perform();
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-Space-Closed");
	}

	/** Verify Shell tool opened and ThingInspector closed with search tool opened */
	@Test
	public void testShellTools() {
		Actions action = new Actions(driver);

		page.modifiedTIWithClose.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyBrowserViewBox("ModifiedTI-with-Close-Opened");

		// Open Search Tool
		page.searchTool.click();
		waitForReady(2000);
		action.sendKeys("text").perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-SearchTool-Opened");

		// Navigate to an item that is using preventDefault for its event
		page.thingInspector.selectFacet(page.feedID);
		this.waitForElement(driver, true, page.dialogID, timeOutSeconds);
		waitForReady(millisecond);
		verifyBrowserViewBox("PreventDefaultItem");
		action.sendKeys(Keys.ESCAPE).perform();

		// Close ThingInspector with search tool opened
		page.closeBtn.click();
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-with-Close-Closed");
	}

	/** Verify Shell options, changing header type and side areas in Shell */
	@Test
	public void testShellOptions() {
		page.modifiedTIWithOpen.click();
		waitForReady(millisecond);

		// Change Header type to 'Brand Only'
		page.headerTypeGroup.selectRadio(page.brandOnlyRadioID);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-HeaderType-BrandOnly");

		// Change Header type to 'No Navigation'
		page.headerTypeGroup.selectRadio(page.noNavRadioID);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-HeaderType-NoNavigation");

		// Change Header type to 'Slim Navigation'
		page.headerTypeGroup.selectRadio(page.slimNavRadioID);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-HeaderType-SlimNavigation");

		// Change Header type to 'Standard'
		page.headerTypeGroup.selectRadio(page.standardRadioID);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-HeaderType-Standard");

		// Hide shell tools and sidepane
		page.showToolCheckbox.toggle();
		page.showPaneCheckbox.toggle();
		userAction.mouseMove(driver, page.showPaneCheckbox.getId());
		verifyBrowserViewBox("HideSidebars");

		//Show shell tools and sidepane
		page.showToolCheckbox.toggle();
		page.showPaneCheckbox.toggle();
		userAction.mouseMove(driver, page.showPaneCheckbox.getId());
		verifyBrowserViewBox("ShowSidebars");
	}

}