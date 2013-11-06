package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ToggleButtonPO;
import com.sap.ui5.selenium.common.TestBase;

public class ToggleButtonTest extends TestBase {

	private ToggleButtonPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/ToggleButton.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ToggleButtonPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		waitForReady(1000);
		verifyPage("full-initial");

		// Test all disabled elements
		page.clickEnabledCB(driver, userAction);
		verifyPage("full-disabled");

		// Test all enabled elements
		page.clickEnabledCB(driver, userAction);
		verifyPage("full-enabled");
	}

	@Test
	public void testMouseOverAction() {
		String elementId = page.toggleButton1cId;

		// ------------ Mouse over on enabled buttons --------------
		userAction.mouseOver(driver, elementId, 1000);
		verifyElement(elementId, "MouseOver-" + elementId);
		userAction.mouseMoveToStartPoint(driver);
	}

	@Test
	public void testClickAction() {
		String elementId = page.toggleButton2cId;

		// ------------ Click on enabled buttons --------------
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);

		verifyElement(elementId, "Click-" + elementId);
		verifyElement(page.outputTargetId, "Click-outputTarget-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		// ------------ Enter/Space Key --------------
		userAction.pressOneKey(KeyEvent.VK_TAB);
		verifyElement(page.toggleButton1aId, "KB-unfocused-" + page.toggleButton1aId);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		verifyElement(page.toggleButton1aId, "KB-focused-" + page.toggleButton1aId);

		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(page.outputTargetId, "Enter-outputTarget-" + page.toggleButton1aId);

		userAction.pressOneKey(KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_SPACE);
		verifyElement(page.outputTargetId, "Space-outputTarget-" + page.toggleButton1bId);
	}

}
