package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.TabStripPO;
import com.sap.ui5.selenium.common.TestBase;

public class TabStripTest extends TestBase {

	private TabStripPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/TabStrip.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TabStripPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseOverAction() {

		// ------------ Move mouse over tab Strip1 Monday --------------
		String elementId = page.tabStrip1MondayId;
		String tabStripId = elementId.substring(0, 9);

		userAction.mouseMove(driver, elementId);
		verifyElementUI(tabStripId, "MouseOver-Monday-" + tabStripId);

		// ------------ Move mouse over tab Strip1 Tuesday --------------
		elementId = page.tabStrip1TuesdayId;

		userAction.mouseMove(driver, elementId);
		verifyElementUI(tabStripId, "MouseOver-Tuesday-" + tabStripId);
	}

	@Test
	public void testClickAction() {

		// ------------ Click tab Strip1 Monday --------------
		String elementId = page.tabStrip1MondayId;
		String tabStripId = elementId.substring(0, 9);

		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(tabStripId, "Click-Monday-" + tabStripId);

		// ------------ Click tab Strip1 Tuesday --------------
		elementId = page.tabStrip1TuesdayId;

		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(page.millisecond);
		verifyElementUI(tabStripId, "Click-Tuesday-" + tabStripId);
		verifyElementUI(page.outputArea, "CheckEvent-Select-Tuesday-" + tabStripId);

		// ------------ Click close tabs Wednesday--------------
		elementId = page.tabStrip1WednesdayCloseId;

		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(tabStripId, "Close-Wednesday-" + elementId);
		verifyElementUI(page.outputArea, "CheckEvent-Close-Wednesday-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		Actions action = new Actions(driver);
		String elementId = page.tabStrip1Id;

		userAction.pressOneKey(KeyEvent.VK_TAB);

		// ------------ Close closeable tabs of a tabStrip1 --------------
		verifyElementUI(elementId, "KB-Monday-Selected-Focused-" + elementId);

		if (isRtlTrue()) {
			userAction.pressOneKey(KeyEvent.VK_LEFT);
		} else {
			userAction.pressOneKey(KeyEvent.VK_RIGHT);
		}
		verifyElementUI(elementId, "KB-Tuesday-Focused-" + elementId);
		sendKeys(driver, KeyEvent.VK_SPACE);
		verifyElementUI(elementId, "KB-SPACE-TuesdaySelected-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Tuesday-Select-" + elementId);

		sendKeys(driver, KeyEvent.VK_END);
		verifyElementUI(elementId, "KB-Sunday-Focused-" + elementId);
		sendKeys(driver, KeyEvent.VK_ENTER);
		verifyElementUI(elementId, "KB-ENTER-SundaySelected-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Sunday-Select-" + elementId);
		userAction.pressOneKey(KeyEvent.VK_DELETE);
		verifyElementUI(elementId, "KB-Sunday-Closed-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Sunday-Close-" + elementId);

		userAction.pressOneKey(KeyEvent.VK_SPACE);
		verifyElementUI(elementId, "KB-SPACE-SaturdaySelected-" + elementId);

		userAction.pressOneKey(KeyEvent.VK_UP);
		verifyElementUI(elementId, "KB-Friday-Focused-" + elementId);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElementUI(elementId, "KB-ENTER-FridaySelected-" + elementId);

		if (isRtlTrue()) {
			userAction.pressOneKey(KeyEvent.VK_RIGHT);
		} else {
			userAction.pressOneKey(KeyEvent.VK_LEFT);
		}
		verifyElementUI(elementId, "KB-Thursday-Focused-" + elementId);
		sendKeys(driver, KeyEvent.VK_SPACE);
		verifyElementUI(elementId, "KB-SPACE-ThursdaySelected-" + elementId);
		userAction.pressOneKey(KeyEvent.VK_DELETE);
		verifyElementUI(elementId, "KB-Thursday-Closed-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Thursday-Close-" + elementId);

		userAction.pressOneKey(KeyEvent.VK_HOME);
		verifyElementUI(elementId, "KB-Monday-Unselected-Focused-" + elementId);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElementUI(elementId, "KB-ENTER-MondaySelected-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Monday-Select-" + elementId);

		if (isRtlTrue()) {
			action.sendKeys(Keys.LEFT, Keys.DOWN).perform();
		} else {
			action.sendKeys(Keys.RIGHT, Keys.DOWN).perform();
		}
		verifyElementUI(elementId, "KB-Wednesday-Focused-" + elementId);
		userAction.pressOneKey(KeyEvent.VK_SPACE);
		verifyElementUI(elementId, "KB-SPACE-WednesdaySelected-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Wednesday-Select-" + elementId);
		sendKeys(driver, KeyEvent.VK_DELETE);
		verifyElementUI(elementId, "KB-Wednesday-Closed-" + elementId);
		verifyElementUI(page.outputArea, "KB-CheckEvent-Wednesday-Close-" + elementId);
	}

	@Test
	public void testTabStripTooltip() {
		String elementId = page.tabStrip2WednesdayCloseId;

		showToolTip(elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip-Wednesday-" + elementId);
	}

	public void sendKeys(WebDriver driver, int key) {
		userAction.pressOneKey(key);
		waitForReady(page.millisecond);
	}

}
