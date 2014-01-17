package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.TextAreaPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.UI5Timeout;

public class TextAreaTest extends TestBase {

	private TextAreaPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/TextArea.html";

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(20 * 60 * 1000); // 20 minutes

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TextAreaPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testClickAction() {
		Actions action = new Actions(driver);
		WebElement element = page.textArea7;
		String elementId = element.getAttribute("id");

		// ------------ Click event on TextArea7 --------------
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();

		verifyElement(elementId, "Click-" + elementId);
	}

	@Test
	public void testDoubleClickAction() {
		WebElement element = page.textArea5;
		String elementId = element.getAttribute("id");

		// ------------ Double-click event on TextArea5 ---------------
		// Increase stability on Chrome
		if (getBrowserType() == Constants.CHROME) {
			new Actions(driver).doubleClick(element).perform();
		} else {
			userAction.mouseDoubleClick(driver, elementId);
			userAction.mouseMoveToStartPoint(driver);
		}
		verifyElement(elementId, "DoubleClick-" + elementId);
	}

	@Test
	public void testChangeTextEvent() {
		WebElement element = page.textArea8;
		String elementId = element.getAttribute("id");

		// ------------ Change event of TextArea --------------
		element.sendKeys("Event by leaving TextArea with mouse click on page");
		userAction.mouseClickStartPoint(driver);

		verifyElement(elementId, "LeaveFocusMouseClick-" + elementId);
		verifyElement("currentText", "CurrentText-LeaveFocusMouseClick-" + elementId);

		// ------------ Script escaping --------------
		element.sendKeys("<script>alert('xss')</script>");
		userAction.mouseClickStartPoint(driver);

		verifyElement(elementId, "EscapedCrossSiteScripting-" + elementId);
		verifyElement("currentText", "CurrentText-EscapedCrossSiteScripting-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		Actions action = new Actions(driver);
		userAction.mouseClickStartPoint(driver);
		WebElement element = page.textArea10;
		String elementId = element.getAttribute("id");
		Point p = userAction.getElementLocation(driver, elementId);
		Point location = null;

		action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();

		// ------------ TextArea rendering with all text selected --------------
		action.sendKeys(Keys.chord(Keys.CONTROL, Keys.HOME)).perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();

		verifyElement(elementId, "AllSelected-" + elementId);

		// ------------ Text is discarded on pressing ESCAPE key --------------
		element.sendKeys("This text should not be visible!");
		element.sendKeys(Keys.ESCAPE);
		element.sendKeys(Keys.chord(Keys.CONTROL, Keys.HOME));
		element.sendKeys(Keys.chord(Keys.CONTROL, "a"));

		verifyElement(elementId, "ESCAPE-" + elementId);

		// ------------ TextArea rendering with partly text selected by press "CONTROL + SHIFT + LEFT" or --------------
		// ------------ "CONTROL + SHIFT + RIGHT" --------------
		userAction.mouseClickStartPoint(driver);
		if (isRtlTrue()) {
			int width = element.getSize().width;
			// Use userAction to avoid twinkle of textArea border on IE9
			location = new Point(p.x + width - 40, p.y + 5);
			userAction.mouseDoubleClick(location);
			userAction.mouseMoveToStartPoint(driver);

			for (int i = 1; i <= 3; i++) {
				element.sendKeys(Keys.chord(Keys.CONTROL, Keys.SHIFT, Keys.LEFT));
			}
		} else {
			// Use userAction to avoid twinkle of textArea border on IE9
			location = new Point(p.x + 35, p.y + 5);
			userAction.mouseDoubleClick(location);
			userAction.mouseMoveToStartPoint(driver);

			for (int i = 1; i <= 3; i++) {
				element.sendKeys(Keys.chord(Keys.CONTROL, Keys.SHIFT, Keys.RIGHT));
			}
		}
		verifyElement(elementId, "PartlySelectedOfWord-" + elementId);

		// ------------ TextArea rendering with partly text selected by press "SHIFT + LEFT" or "SHIFT + RIGHT"
		userAction.mouseClickStartPoint(driver);
		if (isRtlTrue()) {
			int width = element.getSize().width;
			// Use userAction to avoid twinkle of textArea border on IE9
			location = new Point(p.x + width - 40, p.y + 5);
			userAction.mouseDoubleClick(location);
			userAction.mouseMoveToStartPoint(driver);

			for (int i = 1; i <= 3; i++) {
				element.sendKeys(Keys.chord(Keys.SHIFT, Keys.LEFT));
			}
		} else {
			// Use userAction to avoid twinkle of textArea border on IE9
			location = new Point(p.x + 35, p.y + 5);
			userAction.mouseDoubleClick(location);
			userAction.mouseMoveToStartPoint(driver);

			for (int i = 1; i <= 3; i++) {
				element.sendKeys(Keys.chord(Keys.SHIFT, Keys.RIGHT));
			}
		}
		verifyElement(elementId, "PartlySelectedOfCharacter-" + elementId);

		element = page.textArea8;
		elementId = element.getAttribute("id");

		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		waitForReady(page.millisecond);

		// ------------ Change event of TextArea --------------
		element.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		element.sendKeys("Event by leaving TextArea with TAB");
		element.sendKeys(Keys.TAB);
		waitForReady(page.millisecond);

		verifyElement(elementId, "LeaveFocusWithTAB-" + elementId);
		verifyElement("currentText", "CurrentText-LeaveFocusWithTAB-" + elementId);

		// ------------ script escaping --------------
		element.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
		element.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		element.sendKeys(Keys.DELETE);
		element.sendKeys("<script>alert('xss')</script>");
		element.sendKeys(Keys.TAB);
		waitForReady(page.millisecond);

		verifyElement(elementId, "KB-EscapedCrossSiteScripting-" + elementId);
		verifyElement("currentText", "CurrentText-KB-EscapedCrossSiteScripting-" + elementId);
	}

	@Test
	public void testTextAreaTooltip() {
		String elementId = page.textArea14.getAttribute("id");

		showToolTip(elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

}
