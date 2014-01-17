package com.sap.ui5.modules.librarytests.ux3.tests;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.ShellPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.JsAction;
import com.sap.ui5.selenium.util.UI5Timeout;

public class ShellTest extends TestBase {

	private ShellPO page;

	private final int millisecond = 1000;

	private final int timeOutSeconds = 10;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/Shell.html";

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(20 * 60 * 1000);

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ShellPO.class);
		UI5PageFactory.initElements(driver, page);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	/** Verify tools on the toolbar */
	@Test
	public void testToolbar() {
		Actions action = new Actions(driver);

		// Mouse Over tool on the the toolbar
		userAction.mouseOver(driver, page.searchTool.getAttribute("id"), millisecond);
		verifyBrowserViewBox("MouseOver-tool-" + page.searchTool.getAttribute("id"));

		// Open and close tool on the toolbar
		userAction.mouseClick(driver, page.searchTool.getAttribute("id"));
		waitForReady(millisecond);
		action.sendKeys("text").perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		userAction.mouseMoveToStartPoint(driver);
		verifyBrowserViewBox("SearchTool-Opened");

		userAction.mouseClick(driver, page.searchTool.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		waitForReady(1200);
		verifyElement(page.leftSideToolsID, "SearchTool-Closed");

		userAction.mouseClickStartPoint(driver);
		userAction.mouseClick(driver, page.feederTool.getAttribute("id"));
		waitForReady(millisecond);
		action.sendKeys("text").perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		verifyBrowserViewBox("FeederTool-Opened");

		userAction.mouseClick(driver, page.feederTool.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyElement(page.leftSideToolsID, "FeederTool-Closed");

		userAction.mouseClick(driver, page.optionsPopupTool.getAttribute("id"));
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		verifyBrowserViewBox("OptionsPopupTool-Opened");

		userAction.mouseClick(driver, page.optionsPopupTool.getAttribute("id"));
		this.waitForElement(driver, false, page.optionPopDivID, timeOutSeconds);
		verifyElement(page.leftSideToolsID, "OptionsPopupTool-Closed");
		userAction.mouseMoveToStartPoint(driver);

		// Open tool without closing the previous tool
		userAction.mouseClick(driver, page.searchTool.getAttribute("id"));
		waitForReady(millisecond);
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		verifyBrowserViewBox("SearchTool-OptionsPopupTool-Opened");
	}

	/** Verify Shell options*/
	@Test
	public void testShellOptions() {
		// Hide/Show Header Shell areas
		userAction.mouseClick(driver, page.optionsPopupTool.getAttribute("id"));
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.brandOnlyID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-BrandOnly");

		// Hide top level navigation, but show Title
		JsAction.focusOnElement(driver, page.optionsPopupTool);
		JsAction.clickElement(driver, page.optionsPopupTool);
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.noNavigationID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-noNavigation");

		// Show slim top level navigation
		JsAction.focusOnElement(driver, page.optionsPopupTool);
		JsAction.clickElement(driver, page.optionsPopupTool);
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.slimNavID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-SlimNavigation");

		// Show top level navigation
		JsAction.focusOnElement(driver, page.optionsPopupTool);
		JsAction.clickElement(driver, page.optionsPopupTool);
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.standardID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-Standard");

		// Hide/Show tools and sidepane
		page.showTool.toggle();
		page.showPane.toggle();
		userAction.mouseMove(driver, page.showPane.getId());
		verifyBrowserViewBox("Hide-Tools-and-SidePane");

		page.showTool.toggle();
		page.showPane.toggle();
		userAction.mouseMove(driver, page.showPane.getId());
		verifyBrowserViewBox("Show-Tools-and-SidePane");

		// Enable/Disable tools
		page.showSearch.toggle();
		page.showFeeder.toggle();
		verifyElement(page.leftSideToolsID, "Search-and-Feeder-Disabled");

		page.showLogout.toggle();
		verifyElement(page.shellHeaderID, "LogoutButton-Disabled");

		page.showSearch.toggle();

		page.showFeeder.toggle();
		verifyElement(page.leftSideToolsID, "Search-and-Feeder-Enabled");

		page.showLogout.toggle();
		verifyElement(page.shellHeaderID, "LogoutButton-Enabled");
	}

	/** Verify Shell navigation */
	@Test
	public void testShellNavigation() {

		// Check jumping directly to a specific area in the Shell navigation
		page.jumpNews.click();
		waitForReady(millisecond);
		verifyElement(page.cavasID, "Jump-News");

		userAction.mouseMove(driver, page.overviewID);
		userAction.mouseClick(driver, page.overviewID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1500);
		verifyElement(page.cavasID, "Overview-Home");

		// Navigate to items
		userAction.mouseOver(driver, page.marketingID, millisecond);
		page.myShell.selectWorksetItem(page.marketingID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.marketingID);
		verifyElement(page.workSetBarID, "Nav-To-Marketing");

		page.myShell.selectWorksetItem(page.marketInfoID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.marketInfoID);
		verifyElement(page.facetBarListID, "Nav-To-MarketInformation");

		//Check navigation bar overflow behavior
		page.myShell.selectWorksetItem(page.salesOrderID);
		waitForReady(millisecond);
		driver.manage().window().setPosition(new Point(50, 50));
		driver.manage().window().setSize(new Dimension(520, 800));
		waitForReady(millisecond);
		this.waitForElement(driver, true, page.navLeft.getAttribute("id"), timeOutSeconds);
		this.waitForElement(driver, true, page.navRight.getAttribute("id"), timeOutSeconds);
		waitForReady(2000);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1500);
		userAction.mouseOver(driver, page.salesOrderID, millisecond);
		verifyPage("Window-Resize");

		page.navRight.click();
		waitForReady(1500);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1000);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navRight.getAttribute("id"));
		}
		verifyElement(page.workSetBarID, "Nav-Overflow-Right");

		page.navRight.click();
		waitForReady(1500);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1000);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navRight.getAttribute("id"));
		}
		verifyElement(page.workSetBarID, "Nav-Overflow-End");

		page.navLeft.click();
		waitForReady(1500);
		userAction.mouseClickStartPoint(driver);
		waitForReady(500);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navLeft.getAttribute("id"));
		}
		verifyElement(page.workSetBarID, "Nav-Overflow-Left");

		page.navLeft.click();
		waitForReady(1500);
		userAction.mouseClickStartPoint(driver);
		waitForReady(500);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navLeft.getAttribute("id"));
		}
		verifyElement(page.workSetBarID, "Nav-Overflow-Begin");
	}

	/** Verify modification of Shell */
	@Test
	public void testModifyShell() {

		page.myShell.selectWorksetItem(page.workSetContentID);
		waitForReady(millisecond);

		// Add new workset bar item
		page.contentInput.setValue("Workset");
		page.addWorksetItemBtn.click();
		verifyElement(page.workSetBarID, "Add-WorksetItem-on-" + page.workSetBarID);

		// Remove workset bar item 
		page.removeWorksetItemBtn.click();
		verifyElement(page.workSetBarID, "Remove-WorksetItem-from-" + page.workSetBarID);

		// Add new facet bar item
		page.contentInput.clearValue();
		page.contentInput.setValue("Facet");
		page.addFacetBtn.click();
		verifyElement(page.facetBarID, "Add-FacetItem-on-" + page.facetBarID);

		// Remove facet bar item
		page.removeFacetBtn.click();
		verifyElement(page.facetBarID, "Remove-FacetItem-from-" + page.facetBarID);

		// Change application title
		page.contentInput.clearValue();
		page.contentInput.setValue("New Title");
		page.changeTitleBtn.click();
		verifyElement(page.headerID, "ChangeTitle");

		// Add new pane bar item
		page.contentInput.clearValue();
		page.contentInput.setValue("Pane");
		page.addPaneBarBtn.click();
		verifyElement(page.paneBarID, "Add-PaneItem-on-" + page.paneBarID);

		// Remove pane bar item
		page.removePaneBarBtn.click();
		verifyElement(page.paneBarID, "Remove-PaneItem-from-" + page.paneBarID);

		page.contentInput.clearValue();
		page.contentInput.setValue("New Pane1");
		page.addPaneBarBtn.click();

		page.contentInput.clearValue();
		page.contentInput.setValue("New Pane2");
		page.addPaneBarBtn.click();
		page.myShell.selectWorksetItem(page.salesOrderID);

		driver.manage().window().setPosition(new Point(50, 50));
		driver.manage().window().setSize(new Dimension(600, 450));
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1500);
		page.panebarOverflow.click();
		waitForReady(millisecond);
		verifyBrowserViewBox("Sidepane-Overflow");
	}

	/** Verify logout Shell */
	@Test
	public void testLogout() {
		userAction.mouseOver(driver, page.logoutID, millisecond);
		verifyElement(page.logoutID, "MouseOver-Logout");
		userAction.mouseClickStartPoint(driver);

		userAction.mouseClick(driver, page.logoutID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyBrowserViewBox("Logout-Shell");
	}

	private boolean isAboveIE8() {

		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10 || getBrowserType() == Constants.IE11) {
			return true;
		}
		return false;
	}

}