package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ButtonPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.UI5Timeout;

public class ButtonTest extends TestBase {

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(25 * 60 * 1000); // 25 minutes

	ButtonPO page;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Button.html";

	@Before
	public void setUp() {

		page = PageFactory.initElements(driver, ButtonPO.class);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI, Check enable and visible all elements */
	@Test
	public void testAllElements() {

		// Test all initial elements
		verifyPage("full-initial");

		// Test all disabled elements
		page.clickEnabledCB(driver, userAction);
		verifyPage("full-disabled");

		// Test all enabled elements
		page.clickEnabledCB(driver, userAction);
		verifyPage("full-enabled");

		// Test all invisible elements
		page.clickVisibleCB(driver, userAction);
		verifyPage("full-invisible");

		// Test all visible elements
		page.clickVisibleCB(driver, userAction);
		verifyPage("full-visible");
	}

	/** Verify the mouse click for enable button elements */
	@Test
	public void testMouseClickEnabledElements() {

		multipleTabs(3);

		int next = 1;
		for (int i = 0; i < page.buttons.size(); i = i + next) {

			String elementId = page.buttons.get(i).getAttribute("id");
			userAction.mouseClick(driver, elementId);
			userAction.mouseMoveToStartPoint(driver);

			verifyElement(elementId, "Click-" + elementId);
			verifyElement(page.outputTarget.getAttribute("id"), "Click-outputTarget-" + elementId);
			multipleTabs(next);
		}
	}

	/** Verify the mouse over for enable button elements */
	@Test
	public void testMouseOverEnabledElements() {

		int next = 6;
		for (int i = 0; i < page.buttons.size() - 2; i = i + next) {

			String elementId = page.buttons.get(i).getAttribute("id");
			userAction.mouseOver(driver, elementId, 800);

			verifyElement(elementId, "MouseOver-" + elementId);
		}
	}

	/** Verify the mouse select for enable button elements */
	@Test
	public void testMouseSelectEnabledElements() {
		// Avoid unstable dashed frame on Firfox testing.
		// Use keyboard to focus on the button then click.
		multipleTabs(3);

		int next = 6;
		for (int i = 0; i < page.buttons.size(); i = i + next) {

			String elementId = page.buttons.get(i).getAttribute("id");
			userAction.mouseClickAndHold(driver, elementId);
			verifyElement(elementId, "MouseSelect-" + elementId);
			userAction.mouseRelease();

			multipleTabs(next);
		}
	}

	/** Verify the mouse action on disabled elements: mouseover and click */
	@Test
	public void testMouseActionDisabledElements() {

		// Disable all elements
		page.clickEnabledCB(driver, userAction);

		WebElement e = page.buttons.get(0);
		String elementId = e.getAttribute("id");

		// Test Mouse Over
		userAction.mouseOver(driver, elementId, 800);
		verifyElement(elementId, "MouseOver-Disabled" + elementId);

		// Test click
		e.click();
		verifyElement(elementId, "Clicke-disabled" + elementId);

		if (page.outputTarget.getSize().equals(new Dimension(0, 0))) {
			// this test is pass if outputTarget element size is 0 OR no text.
		} else {
			verifyElement(page.outputTarget.getAttribute("id"), "outputTarget-empty");
		}

	}

	/** Verify trigger button tooltip by mouseover */
	@Test
	public void testButtonTooltip() {

		String elementIdBtn4 = page.elementIdBtn4.getAttribute("id");
		String elementIdBtn5 = page.elementIdBtn5.getAttribute("id");

		// Handler situation(Firefox and RTL=true)
		userAction.mouseOver(driver, elementIdBtn4, 1000);
		userAction.mouseMoveToStartPoint(driver);

		// Test tooltip on enabled button
		userAction.mouseOver(driver, elementIdBtn4, 3000);
		verifyBrowserViewBox("btn4-tooltip");

		userAction.mouseOver(driver, elementIdBtn5, 3000);
		verifyBrowserViewBox("btn5-tooltip");

		// Test tooltip on disabled button
		page.clickEnabledCB(driver, userAction);

		userAction.mouseOver(driver, elementIdBtn4, 3000);
		verifyBrowserViewBox("btn4-disabled-tooltip");

		userAction.mouseOver(driver, elementIdBtn5, 3000);
		verifyBrowserViewBox("btn5-disabled-tooltip");

	}

	/** Verify the keyboard action like TAB, Enter */
	@Test
	public void testKeyboardEnterAction() {

		multipleTabs(3);

		int next = 6;
		for (int i = 0; i < page.buttons.size(); i = i + next) {

			userAction.pressOneKey(KeyEvent.VK_ENTER);

			String elementId = page.buttons.get(i).getAttribute("id");
			verifyElement(elementId, "Enter-" + elementId);
			verifyElement(page.outputTarget.getAttribute("id"), "Enter-outputTarget-" + elementId);

			multipleTabs(next);
		}
	}

	/** Verify the keyboard action like TAB, Space */
	@Test
	public void testKeyboardSpaceAction() {

		multipleTabs(3);

		int next = 6;
		for (int i = 0; i < page.buttons.size(); i = i + next) {

			userAction.pressOneKey(KeyEvent.VK_SPACE);

			String elementId = page.buttons.get(i).getAttribute("id");
			verifyElement(elementId, "Space-" + elementId);
			verifyElement(page.outputTarget.getAttribute("id"), "Space-outputTarget-" + elementId);

			multipleTabs(next);
		}
	}

}
