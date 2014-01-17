package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.SliderPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class SliderTest extends TestBase {

	private SliderPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Slider.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, SliderPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testDragAndDropAction() {
		int x = 0;
		int y = 0;
		String elementId = page.slider1Id;
		WebElement element = driver.findElement(By.id(elementId));

		WebElement grip = driver.findElement(By.id(elementId + page.gripSuffix));
		Dimension d = userAction.getElementDimension(driver, elementId + page.hiliSuffix);

		x = grip.getSize().width / 2;
		y = element.getSize().height - 3;

		// ------------ Check Drag and Drop on Slider control --------------
		if (getBrowserType() == Constants.IE10 || getBrowserType() == Constants.IE11) {
			userAction.dragAndDrop(driver, elementId + page.gripSuffix, x, (int) (y * 0.25) - d.height + 2);
		} else {
			userAction.dragAndDrop(driver, elementId + page.gripSuffix, x, (int) (y * 0.25) - d.height);
		}
		userAction.mouseMoveToStartPoint(driver);

		verifyElement(page.targetPrefix + elementId, "DandD-Up-" + page.targetPrefix + elementId);
		verifyElement(page.outputEventId, "DandD-Up-" + elementId);

		if (!element.getAttribute("class").contains("sapUiSliDsbl")
				&& !element.getAttribute("class").contains("sapUiSliRo")) {
			userAction.dragAndDrop(driver, elementId + page.gripSuffix, x, (int) (y * 0.75) - d.height);
			userAction.mouseMoveToStartPoint(driver);

			verifyElement(page.targetPrefix + elementId, "DandD-Down-" + page.targetPrefix + elementId);
			verifyElement(page.outputEventId, "DandD-Down-" + elementId);

			userAction.dragAndDrop(driver, elementId + page.gripSuffix, x, d.height - y);
			userAction.mouseMoveToStartPoint(driver);

			verifyElement(page.targetPrefix + elementId, "DandD-Begin-" + page.targetPrefix + elementId);
			verifyElement(page.outputEventId, "DandD-Begin-" + elementId);

			if (getBrowserType() == Constants.IE10 || getBrowserType() == Constants.IE11) {
				userAction.dragAndDrop(driver, elementId + page.gripSuffix, x, 2 * d.height + 2);
			} else {
				userAction.dragAndDrop(driver, elementId + page.gripSuffix, x, 2 * d.height);
			}
			userAction.mouseMoveToStartPoint(driver);

			verifyElement(page.targetPrefix + elementId, "DandD-End-" + page.targetPrefix + elementId);
			verifyElement(page.outputEventId, "DandD-End-" + elementId);
		}
	}

	@Test
	public void testValueSelectionEvent() {
		String elementId = page.slider6Id;

		// ------------ Click on slider7 center --------------
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.targetPrefix + elementId, "ClickOnSlider-" + page.targetPrefix + elementId);
		verifyElement(page.outputEventId, "ClickOnSlider-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		List<WebElement> eList = page.sliders;
		Actions action = new Actions(driver);

		// ------------ Keyboard navigation on Slider control --------------
		for (WebElement element : eList) {
			String elementId = element.getAttribute("id");

			if (!element.getAttribute("class").contains("sapUiSliRo")) {
				action.sendKeys(Keys.TAB).perform();

				if (!element.getAttribute("class").contains("sapUiSliDsbl")) {
					// ------------ Unfocus slider with SHIFT+TAB key --------------
					if (elementId.equals(page.slider1Id)) {
						action.sendKeys(Keys.TAB).perform();
					} else {
						action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
					}
					verifyElement(page.targetPrefix + elementId, "FocusOut-" + page.targetPrefix + elementId);

					// ------------ Focus slider with TAB key --------------
					if (elementId.equals(page.slider1Id)) {
						action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
					} else {
						action.sendKeys(Keys.TAB).perform();
					}
					verifyElement(page.targetPrefix + elementId, "FocusIn-" + page.targetPrefix + elementId);

					// ------------ Decrease small increment with cursor key "Left" --------------
					checkPressKey(Keys.LEFT, "KB-SmallIncrement-Left", elementId);

					// ------------ Decrease small increment with cursor key "Up" --------------
					checkPressKey(Keys.UP, "KB-SmallIncrement-Up", elementId);

					// ------------ Increase small increment with cursor key "Right" --------------
					checkPressKey(Keys.RIGHT, "KB-SmallIncrement-Right", elementId);

					// ------------ Increase small increment with cursor key "Down" --------------
					checkPressKey(Keys.DOWN, "KB-SmallIncrement-Down", elementId);

					// ------------ Decrease large increment with cursor key "CONTROL+Left" --------------
					checkPressKey(KeyEvent.VK_CONTROL, KeyEvent.VK_LEFT, "KB-LargeIncrement-CONTROL-Left", elementId);

					// ------------ Decrease large increment with cursor key "CONTROL+Up" --------------
					checkPressKey(KeyEvent.VK_CONTROL, KeyEvent.VK_UP, "KB-LargeIncrement-CONTROL-Up", elementId);

					// ------------ Increase large increment with cursor key "CONTROL+Right --------------
					checkPressKey(KeyEvent.VK_CONTROL, KeyEvent.VK_RIGHT, "KB-LargeIncrement-CONTROL-Right", elementId);

					// ------------ Increase large increment with cursor key "CONTROL+Down" --------------
					checkPressKey(KeyEvent.VK_CONTROL, KeyEvent.VK_DOWN, "KB-LargeIncrement-CONTROL-Down", elementId);

					// ------------ Decrease to the left end with cursor key "Home" --------------
					checkPressKey(Keys.HOME, "KB-Begin", elementId);

					// ------------ Increase to the right end with cursor key "End" --------------
					checkPressKey(Keys.END, "KB-End", elementId);
				}
			}
		}
	}

	@Test
	public void testSliderTooltip() {
		String elementId = page.slider6Id;

		showToolTip(elementId + page.gripSuffix, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

	public void checkPressKey(Keys key, String expectedImageName, String elementId) {

		new Actions(driver).sendKeys(key).perform();
		verifyElement(page.targetPrefix + elementId, expectedImageName + "-" + page.targetPrefix + elementId);
		verifyElement(page.outputEventId, expectedImageName + "-" + elementId);
	}

	public void checkPressKey(int firstKey, int secondKey, String expectedImageName, String elementId) {

		// Actions sendKeys method of two keys cannot work on IE9
		userAction.pressTwoKeys(firstKey, secondKey);
		verifyElement(page.targetPrefix + elementId, expectedImageName + "-" + page.targetPrefix + elementId);
		verifyElement(page.outputEventId, expectedImageName + "-" + elementId);
	}

}
