package com.sap.ui5.modules.librarytests.commons.tests;

import static org.junit.Assert.assertEquals;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.LinkPO;
import com.sap.ui5.selenium.common.TestBase;

public class LinkTest extends TestBase {

	private LinkPO page;
	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Link.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, LinkPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testTooltip() {
		showToolTip(page.link2Id, 1000);
		verifyBrowserViewBox(page.link2Id + "-Tooltip");
	}

	@Test
	public void testKeyboardAction() {
		userAction.mouseClickStartPoint(driver);
		Actions actions = new Actions(driver);
		actions.sendKeys(Keys.TAB, Keys.TAB).perform();
		verifyElement(page.link2TargetAreaId, page.link2Id + "-focused");
	}

	@Test
	public void testLinkReferenceValues() {
		WebElement link1 = page.enabledLinks.get(0);
		assertEquals("javascript:void(0);", link1.getAttribute("href"));

		WebElement link2 = page.enabledLinks.get(1);
		assertEquals("http://www.sap.com/", link2.getAttribute("href"));
		assertEquals("_blank", link2.getAttribute("target"));

		WebElement link3 = page.enabledLinks.get(2);
		assertEquals("http://www.sap.com/", link3.getAttribute("href"));
		assertEquals("_self", link3.getAttribute("target"));

		WebElement link4 = page.enabledLinks.get(3);
		assertEquals("http://www.sap.com/", link4.getAttribute("href"));
		assertEquals("_search", link4.getAttribute("target"));

	}

	@Test
	public void testClickAction() {
		Actions actions = new Actions(driver);
		// ---------- Test toggle enable state -----------------
		String screenshotId = page.enabledRowId;
		// Test enabled Link
		verifyWhenClickLink(actions, page.link5, screenshotId, "-toggled-enabledLink");

		// Test disabled Link
		verifyWhenClickLink(actions, page.link5, screenshotId, "-toggled-disabledLink");

		// ------------ Test visibility --------------------------
		screenshotId = page.visibleRowId;
		// Test invisible Link
		verifyWhenClickLink(actions, page.link7, screenshotId, "-toggled-invisibleLink");
		// Test visible Link
		verifyWhenClickLink(actions, page.link7, screenshotId, "-toggled-visibleLink");
	}

	private void verifyWhenClickLink(Actions actions, WebElement element, String screenshotId, String imageName) {
		// Avoid twinkle on IE9
		userAction.mouseClick(driver, element.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(screenshotId, element.getAttribute("id") + imageName);
	}

}
