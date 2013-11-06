package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.MenuButtonPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class MenuButtonTest extends TestBase {

	private MenuButtonPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/MenuButton.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, MenuButtonPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		waitForReady(page.millisecond);
		verifyPage("full-initial");
	}

	@Test
	public void testMouseAction() {
		String elementId = page.menuButton2Id;

		// ------------ Click on MenuButton2 --------------
		// Button is twinkling when click by selenium on IE9.
		userAction.mouseClick(driver, elementId);

		// ------------ Move mouse over MenuButton item--------------
		// Item is twinking when mouseOver by Action moveToElement on IE9.
		userAction.mouseMove(driver, elementId + "-itm1");
		// Increase stability on IE10
		if (getBrowserType() == Constants.IE10) {
			verifyBrowserViewBox("Hover-Item1-" + elementId);
		} else {
			verifyElement(page.menu2Id, "Hover-Item1-" + elementId);
		}
		userAction.mouseMoveToStartPoint(driver);

		// ------------ Click on MenuButton item--------------
		driver.findElement(By.id(elementId + "-itm2")).click();
		verifyElement(page.outputTargetId, "Select-Item2-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		waitForReady(page.millisecond);
		String elementId = null;

		// ------------ Key "ALT+DOWN" and "ESCAPE" on menuButton3 --------------
		elementId = page.menuButton3Id;
		page.pressOneKey(userAction, KeyEvent.VK_TAB, 3);
		waitForReady(page.millisecond);
		verifyElement(elementId, "KB-Focused-" + elementId);

		// Actions sendKeys cannot work on IE9
		userAction.pressTwoKeys(KeyEvent.VK_ALT, KeyEvent.VK_DOWN);
		// Increase stability on IE10
		if (getBrowserType() == Constants.IE10) {
			verifyPage("KB-ALT-DOWN-" + elementId);
		} else {
			verifyBrowserViewBox("KB-ALT-DOWN-" + elementId);
		}
		page.pressOneKey(userAction, KeyEvent.VK_ESCAPE, 1);
		waitForReady(page.millisecond);
		verifyBrowserViewBox("KB-Close-ESCAPE-" + elementId);

		// ------------ Key "ENTER" and "RIGHT, SPACE" on menuButton7 --------------
		elementId = page.menuButton7Id;
		page.pressOneKey(userAction, KeyEvent.VK_TAB, 1);

		page.pressOneKey(userAction, KeyEvent.VK_ENTER, 1);
		// Increase stability on IE10
		if (getBrowserType() == Constants.IE10) {
			verifyPage("KB-ENTER-" + elementId);
		} else {
			verifyBrowserViewBox("KB-ENTER-" + elementId);
		}
		page.pressOneKey(userAction, KeyEvent.VK_RIGHT, 1);
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		verifyElement(page.outputTargetId, "KB-Select-SPACE-" + elementId);

		// ------------ Key "SPACE" and "DOWN, ENTER" on menuButton8 --------------
		elementId = page.menuButton8Id;
		page.pressOneKey(userAction, KeyEvent.VK_TAB, 1);

		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		// Increase stability on IE10
		if (getBrowserType() == Constants.IE10) {
			verifyPage("KB-SPACE-" + elementId);
		} else {
			verifyBrowserViewBox("KB-SPACE-" + elementId);
		}
		page.pressOneKey(userAction, KeyEvent.VK_DOWN, 1);
		page.pressOneKey(userAction, KeyEvent.VK_ENTER, 1);
		verifyElement(page.outputTargetId, "KB-Select-ENTER-" + elementId);
	}

	@Test
	public void testMenuButtonTooltip() {
		String elementId = page.menuButton1Id;

		showToolTip(elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

}
