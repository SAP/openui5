package com.sap.ui5.modules.librarytests.ux3.tests;

import org.junit.After;
import org.junit.Before;
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

public class ShellTest extends TestBase {

	private ShellPO page;

	private final int millisecond = 1000;

	private final int timeOutSeconds = 10;

	private final String targetUrl = "/test-resources/sap/ui/ux3/visual/Shell.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ShellPO.class);
		UI5PageFactory.initElements(driver, page);

		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@After
	public void tearDown() {
		driver.quit();
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	/** Verify tools on the toolbar */
	@Test
	public void testToolbar() {
		Actions action = new Actions(driver);

		// Mouse Over tool on the the toolbar
		userAction.mouseOver(driver, page.searchTool.getAttribute("id"), millisecond);
		verifyBrowserViewBox("MouseOver-tool-" + page.searchTool.getAttribute("id"));

		// Open and close tool on the toolbar
		page.searchTool.click();
		waitForReady(millisecond);
		action.sendKeys("text").perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		userAction.mouseMoveToStartPoint(driver);
		verifyBrowserViewBox("SearchTool-Opened");

		page.searchTool.click();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyElementUI(page.leftSideToolsID, "SearchTool-Closed");

		page.feederTool.click();
		waitForReady(millisecond);
		action.sendKeys("text").perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		userAction.mouseMoveToStartPoint(driver);
		verifyBrowserViewBox("FeederTool-Opened");

		page.feederTool.click();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyElementUI(page.leftSideToolsID, "FeederTool-Closed");

		page.optionsPopupTool.click();
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		verifyBrowserViewBox("OptionsPopupTool-Opened");

		page.optionsPopupTool.click();
		this.waitForElement(driver, false, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyElementUI(page.leftSideToolsID, "OptionsPopupTool-Closed");

		// Open tool without closing the previous tool
		page.searchTool.click();
		waitForReady(millisecond);
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		verifyBrowserViewBox("SearchTool-OptionsPopupTool-Opened");
	}

	/** Verify Shell options*/
	@Test
	public void testShellOptions() {

		// Hide/Show Header Shell areas
		page.optionsPopupTool.click();
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.brandOnlyID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-BrandOnly");

		// Hide top level navigation, but show Title
		page.optionsPopupTool.click();
		waitForReady(millisecond);
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.noNavigationID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-noNavigation");

		// Show slim top level navigation
		page.optionsPopupTool.click();
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.slimNavID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-SlimNavigation");

		// Show top level navigation
		page.optionsPopupTool.click();
		this.waitForElement(driver, true, page.optionPopDivID, timeOutSeconds);
		userAction.mouseClick(driver, page.optionHeaderIconID);
		this.waitForElement(driver, true, page.headerTypeList.getId(), timeOutSeconds);
		page.headerTypeList.selectItem(page.standardID);
		waitForReady(millisecond);
		verifyBrowserViewBox("HeaderType-Standard");

		// Hide/Show tools and sidepane
		page.showTool.toggle();
		page.showPane.toggle();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("Hide-Tools-and-SidePane");

		page.showTool.toggle();
		page.showPane.toggle();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("Show-Tools-and-SidePane");

		// Enable/Disable tools
		page.showSearch.toggle();
		page.showFeeder.toggle();
		verifyElementUI(page.leftSideToolsID, "Search-and-Feeder-Disabled");

		page.showLogout.toggle();
		verifyElementUI(page.shellHeaderID, "LogoutButton-Disabled");

		page.showSearch.toggle();
		this.waitForElement(driver, true, page.searchTool.getAttribute("id"), timeOutSeconds);
		page.showFeeder.toggle();
		this.waitForElement(driver, true, page.feederTool.getAttribute("id"), timeOutSeconds);
		verifyElementUI(page.leftSideToolsID, "Search-and-Feeder-Enabled");

		page.showLogout.toggle();
		this.waitForElement(driver, true, page.logoutID, timeOutSeconds);
		verifyElementUI(page.shellHeaderID, "LogoutButton-Enabled");
	}

	/** Verify Shell navigation */
	@Test
	public void testShellNavigation() {

		// Check jumping directly to a specific area in the Shell navigation
		page.jumpNews.click();
		waitForReady(millisecond);
		verifyElementUI(page.cavasID, "Jump-News");

		userAction.mouseClick(driver, page.overviewID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.cavasID, "Overview-Home");

		// Navigate to items
		userAction.mouseOver(driver, page.marketingID, millisecond);
		page.myShell.selectWorksetItem(page.marketingID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.cavasID, "Nav-To-Marketing");

		page.myShell.selectWorksetItem(page.marketInfoID);
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.cavasID, "Nav-To-MarketInformation");

		//Check navigation bar overflow behavior
		page.myShell.selectWorksetItem(page.salesOrderID);
		waitForReady(millisecond);
		driver.manage().window().setPosition(new Point(50, 50));
		driver.manage().window().setSize(new Dimension(520, 800));

		this.waitForElement(driver, true, page.navLeft.getAttribute("id"), timeOutSeconds);
		this.waitForElement(driver, true, page.navRight.getAttribute("id"), timeOutSeconds);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyFullPageUI("Window-Resize");

		page.navRight.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navRight.getAttribute("id"));
		}
		verifyElementUI(page.workSetBarID, "Nav-Overflow-Right");

		page.navRight.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navRight.getAttribute("id"));
		}
		verifyElementUI(page.workSetBarID, "Nav-Overflow-End");

		page.navLeft.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navLeft.getAttribute("id"));
		}
		verifyElementUI(page.workSetBarID, "Nav-Overflow-Left");

		page.navLeft.click();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.navLeft.getAttribute("id"));
		}
		verifyElementUI(page.workSetBarID, "Nav-Overflow-Begin");
	}

	/** Verify modification of Shell */
	@Test
	public void testModifyShell() {

		page.myShell.selectWorksetItem(page.workSetContentID);
		waitForReady(millisecond);

		// Add new workset bar item
		page.contentInput.setValue("Workset");
		page.addWorksetItemBtn.click();
		verifyElementUI(page.workSetBarID, "Add-WorksetItem-on-" + page.workSetBarID);

		// Remove workset bar item 
		page.removeWorksetItemBtn.click();
		verifyElementUI(page.workSetBarID, "Remove-WorksetItem-from-" + page.workSetBarID);

		// Add new facet bar item
		page.contentInput.clearValue();
		page.contentInput.setValue("Facet");
		page.addFacetBtn.click();
		verifyElementUI(page.facetBarID, "Add-FacetItem-on-" + page.facetBarID);

		// Remove facet bar item
		page.removeFacetBtn.click();
		verifyElementUI(page.facetBarID, "Remove-FacetItem-from-" + page.facetBarID);

		// Change application title
		page.contentInput.clearValue();
		page.contentInput.setValue("New Title");
		page.changeTitleBtn.click();
		verifyElementUI(page.headerID, "ChangeTitle");

		// Add new pane bar item
		page.contentInput.clearValue();
		page.contentInput.setValue("Pane");
		page.addPaneBarBtn.click();
		verifyElementUI(page.paneBarID, "Add-PaneItem-on-" + page.paneBarID);

		// Remove pane bar item
		page.removePaneBarBtn.click();
		verifyElementUI(page.paneBarID, "Remove-PaneItem-from-" + page.paneBarID);

		page.contentInput.clearValue();
		page.contentInput.setValue("New Pane1");
		page.addPaneBarBtn.click();

		page.contentInput.clearValue();
		page.contentInput.setValue("New Pane2");
		page.addPaneBarBtn.click();

		driver.manage().window().setPosition(new Point(50, 50));
		driver.manage().window().setSize(new Dimension(600, 450));
		waitForReady(millisecond);
		page.paneOverflowBtn.click();
		verifyBrowserViewBox("Sidepane-Overflow");
	}

	/** Verify logout Shell  */
	@Test
	public void testLogout() {
		userAction.mouseOver(driver, page.logoutID, millisecond);
		verifyElementUI(page.logoutID, "MouseOver-Logout");

		page.myShell.logout();
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyBrowserViewBox("Logout-Shell");
	}

	private boolean isAboveIE8() {

		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			return true;
		}
		return false;
	}

}