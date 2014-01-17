package com.sap.ui5.modules.librarytests.ux3.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.ThingInspectorPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;

public class ThingInspectorTest extends TestBase {

	private ThingInspectorPO page;

	private final int millisecond = 1000;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/ThingInspector.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ThingInspectorPO.class);
		UI5PageFactory.initElements(driver, page);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	/** Verify Standard ThingInspector */
	@Test
	public void testStandardActions() {
		this.waitForElement(driver, true, page.standardTIBtn.getId(), 10);
		page.standardTIBtn.click();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-Opened");

		// Disabled tools
		page.updateCheckBox.toggle();
		page.followCheckBox.toggle();
		page.favoriteCheckBox.toggle();
		page.flagCheckBox.toggle();
		userAction.mouseMove(driver, page.flagCheckBox.getId());
		verifyBrowserViewBox("ThingInspector-AllActions-Disabled");

		// Enable tools
		page.updateCheckBox.toggle();
		page.followCheckBox.toggle();
		page.favoriteCheckBox.toggle();
		page.flagCheckBox.toggle();
		userAction.mouseMove(driver, page.flagCheckBox.getId());
		verifyBrowserViewBox("ThingInspector-AllActions-Enabled");

		// Check open and closed of update tool
		userAction.mouseMoveToStartPoint(driver);
		page.actionBarUpdate.click();
		waitForReady(millisecond);
		page.actionBarUpdateInput.sendKeys("test");
		page.actionBarUpdateInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		verifyElement(page.feederID, "ThingInspector-Update-Open");

		userAction.mouseClick(driver, page.actionBarUpdate.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.actionBarUpdate.getAttribute("id"));
		verifyElement(page.actionBarID, "ThingInspector-Update-Closed");
		userAction.mouseClickStartPoint(driver);

		// Changing status of follow
		page.thingInspector.follow();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-Follow-Start");

		page.thingInspector.pauseFollow();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-Follow-Hold");

		page.thingInspector.continueFollow();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-Follow-Continue");

		page.thingInspector.stopFollow();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-Follow-Stop");

		// Changing status of favorite
		page.thingInspector.favorite();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-markAsFavorite");

		page.thingInspector.favorite();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-unmarkAsFavorite");

		// Changing status of flag
		page.thingInspector.flag();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-Flag");

		page.thingInspector.flag();
		waitForReady(millisecond);
		verifyBrowserViewBox("ThingInspector-unflag");
	}

	/** Verify Navigation Bar */
	@Test
	public void testNavBar() {
		this.waitForElement(driver, true, page.standardTIBtn.getId(), 10);
		page.standardTIBtn.click();
		page.thingInspector.selectFacet(page.accountTeamID);
		waitForReady(millisecond);
		verifyElement(page.facetContentID, "Navigate-To-LastItem-AccountTeam");
	}

	/** Verify ThingGroup resizing */
	@Test
	public void testThingGResize() {
		this.waitForElement(driver, true, page.standardTIBtn.getId(), 10);
		page.standardTIBtn.click();

		// Check the layout of all elements will be changed when resizing the window.
		driver.manage().window().setPosition(new Point(0, 0));
		driver.manage().window().setSize(new Dimension(900, 600));
		waitForReady(millisecond);
		verifyBrowserViewBox("Thing-Groups-Resized");

		driver.manage().window().setPosition(new Point(80, 80));
		driver.manage().window().setSize(new Dimension(800, 700));
		waitForReady(millisecond);
		verifyBrowserViewBox("Thing-Groups-Resized-mini");
	}

	/** Verify closing ThingInspector */
	@Test
	public void testClose() {
		this.waitForElement(driver, true, page.standardTIBtn.getId(), 10);
		page.standardTIBtn.click();
		page.closeBtn.click();
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("StandardTI-Closed");
	}

	/** Verify Modified ThingInspector */
	@Test
	public void testModify() {
		this.waitForElement(driver, true, page.modifiedTIBtn.getId(), 10);
		page.modifiedTIBtn.click();
		waitForReady(millisecond);
		verifyBrowserViewBox("ModifiedTI-Page-Open");

		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.modifiedTIBtn.getId());
		verifyBrowserViewBox("ModifiedTI-ENTER-Closed");
	}
}