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

	private final int millisecond = 800;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/ThingInspectorInShell.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ThingInspectorInShellPO.class);
		UI5PageFactory.initElements(driver, page);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		waitForReady(millisecond);
		verifyPage("full-initial");
	}

	/** Verify Standard ThingInspector */
	@Test
	public void testStandardActions() {
		// Check standard ThingInspector
		this.waitForElement(driver, true, page.standardTIBtn.getId(), timeOutSeconds);
		page.standardTIBtn.click();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("StandardTI-Opened");

		// Disabled actions
		page.updateCheckbox.toggle();
		page.followCheckbox.toggle();
		page.favoriteCheckbox.toggle();
		page.flagCheckbox.toggle();
		userAction.mouseMove(driver, page.flagCheckbox.getId());
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
		userAction.mouseMoveToStartPoint(driver);

		// Check open and closed of update tool
		page.actionBarUpdate.click();
		this.waitForElement(driver, true, page.updatePopupID, timeOutSeconds);
		page.updateInput.sendKeys("test");
		page.updateInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		verifyElement(page.feederID, "StandardTI-Update-Opened");

		page.actionBarUpdate.click();
		this.waitForElement(driver, false, page.updatePopupID, timeOutSeconds);
		verifyElement(page.actionBarID, "StandardTI-Update-Closed");

		// Changing status of follow
		page.thingInspector.follow();
		waitForReady(millisecond);
		verifyBrowserViewBox("StandardTI-Follow-Start");

		page.thingInspector.pauseFollow();
		waitForReady(millisecond);
		verifyBrowserViewBox("StandardTI-Follow-Hold");

		page.thingInspector.continueFollow();
		waitForReady(millisecond);
		verifyBrowserViewBox("StandardTI-Follow-Continue");

		page.thingInspector.stopFollow();
		waitForReady(millisecond);
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
		Actions action = new Actions(driver);

		// Navigate to the last item on the navigation bar
		this.waitForElement(driver, true, page.standardTIBtn.getId(), timeOutSeconds);
		page.standardTIBtn.click();
		waitForReady(millisecond);
		page.thingInspector.selectFacet(page.accountTeamID);
		userAction.mouseMove(driver, page.accountTeamID);
		verifyElement(page.thingViewerID, "Navigate-To-AccountTeam");

		// Open ThingInspector in new window
		action.moveToElement(page.openNew).perform();
		userAction.mouseOver(driver, page.openNew.getAttribute("id"), millisecond);
		verifyElement(page.openNew.getAttribute("id"), "MouseOver-StandardTI-OpenNew");

		userAction.mouseClickStartPoint(driver);
		page.openNew.click();
		this.waitForElement(driver, true, page.openNewID, timeOutSeconds);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-OpenNewWindow");
		page.openNewOKBtn.click();

		// Close ThingInspector
		action.moveToElement(page.standardClose).perform();
		userAction.mouseOver(driver, page.standardClose.getAttribute("id"), millisecond);
		verifyElement(page.standardClose.getAttribute("id"), "MouseOver-StandardTI-Close");
		userAction.mouseClickStartPoint(driver);
		waitForReady(2000);

		page.standardClose.click();
		waitForReady(1500);
		verifyBrowserViewBox("StandardTI-Closed");
	}

	/** Verify ThingGroup resizing and closing by Space button.*/
	@Test
	public void testThingGroupResized() {
		Actions action = new Actions(driver);
		int loopNum = 0;

		// Check the layout of all elements will be changed when resizing the window.
		this.waitForElement(driver, true, page.modifiedTIWithOpen.getId(), timeOutSeconds);
		page.modifiedTIWithOpen.click();
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-with-Open-Opened");

		driver.manage().window().setPosition(new Point(10, 10));
		driver.manage().window().setSize(new Dimension(1250, 550));
		waitForReady(2500);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1500);
		verifyPage("ThingGroupsResized");

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
		waitForReady(1000);
		userAction.mouseMove(driver, page.modifiedTIWithOpen.getId());
		verifyPage("ModifiedTI-Space-Closed");
	}

	/** Verify Shell tool opened and ThingInspector closed with search tool opened */
	@Test
	public void testShellTools() {
		Actions action = new Actions(driver);

		this.waitForElement(driver, true, page.modifiedTIWithClose.getId(), timeOutSeconds);
		page.modifiedTIWithClose.click();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-with-Close-Opened");

		// Open Search Tool
		userAction.mouseClick(driver, page.searchTool.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
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
		waitForReady(2000);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-with-Close-Closed");
	}

	/** Verify Shell options, changing header type and side areas in Shell */
	@Test
	public void testShellOptions() {
		this.waitForElement(driver, true, page.modifiedTIWithOpen.getId(), timeOutSeconds);
		page.modifiedTIWithOpen.click();
		waitForReady(millisecond);

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

		// Change Header type to 'Brand Only'
		page.headerTypeGroup.selectRadio(page.brandOnlyRadioID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyPage("ModifiedTI-HeaderType-BrandOnly");

		// Change Header type to 'No Navigation'
		page.headerTypeGroup.selectRadio(page.noNavRadioID);
		waitForReady(millisecond);
		userAction.mouseClick(driver, page.standardClose.getAttribute("id"));
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-HeaderType-NoNavigation");

		// Change Header type to 'Slim Navigation'
		page.modifiedTIWithOpen.click();
		waitForReady(millisecond);

		page.headerTypeGroup.selectRadio(page.slimNavRadioID);
		waitForReady(millisecond);
		userAction.mouseClick(driver, page.standardClose.getAttribute("id"));
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-HeaderType-SlimNavigation");

		// Change Header type to 'Standard'
		page.modifiedTIWithOpen.click();
		waitForReady(millisecond);

		page.headerTypeGroup.selectRadio(page.standardRadioID);
		waitForReady(millisecond);
		userAction.mouseClick(driver, page.standardClose.getAttribute("id"));
		waitForReady(1200);
		verifyBrowserViewBox("ModifiedTI-HeaderType-Standard");
	}
}