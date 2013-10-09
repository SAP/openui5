package com.sap.ui5.modules.librarytests.commons.tests;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.RadioButtonPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class RadioButtonTest extends TestBase {

	private RadioButtonPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/RadioButton.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, RadioButtonPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseOverAction() {
		String elementId = page.radioBtn10Id;

		// ------------ Move Mouse over RadioButton Label --------------
		userAction.mouseMove(driver, elementId);
		verifyElementUI(elementId, "RBLabel-MouseOver-" + elementId);
	}

	@Test
	public void testClickAction() {
		// Avoid generating no dashed on FIREFOX
		new Actions(driver).sendKeys(Keys.TAB).perform();

		String elementId = page.radioBtn10Id;
		int idx = 0;

		idx = page.position(elementId);

		// ------------ Click On RadioButton Label --------------
		waitForReady(1000);
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);

		verifyElementUI("target" + idx, "RBLabel-Mouse-Click-" + elementId);
		verifyElementUI(page.selStateId, "RBLabel-MouseEvent-Click-" + elementId);
		page.button.click();

		// ------------ Click On RadioButton --------------
		userAction.mouseClick(driver, elementId + page.radioIdSuffix);
		userAction.mouseMoveToStartPoint(driver);

		verifyElementUI("target" + idx, "RB-Mouse-Click-" + elementId);
		verifyElementUI(page.selStateId, "RB-MouseEvent-Click-" + elementId);
		page.button.click();
	}

	@Test
	public void testTextSelection() {
		// Avoid generating no dashed on FIREFOX
		if (getBrowserType() == Constants.FIREFOX) {
			new Actions(driver).sendKeys(Keys.TAB).perform();
		}

		String elementId = page.radioBtn2Id;
		int idx = 0;

		idx = page.position(elementId);

		// ------------ Check text selection of RadioButton label for readonly RadioButtons in enabled/disabled state
		Point p = userAction.getElementLocation(driver, elementId);
		int width = userAction.getElementDimension(driver, elementId).width;
		int startPointX = p.x + width - 50;
		int startPointY = p.y + 8;
		int endPointX = p.x + width - 70;
		int endPointY = p.y + 12;
		if (!userAction.getRtl()) {
			startPointX = p.x + 40;
			endPointX = p.x + 60;
		}
		Point startPoint = new Point(startPointX, startPointY);
		Point endPoint = new Point(endPointX, endPointY);
		userAction.dragAndDrop(driver, startPoint, endPoint);
		userAction.mouseMoveToStartPoint(driver);

		verifyElementUI("target" + idx, "selectText-" + elementId);
		if (elementId.equals(page.radioBtn10Id)) {
			verifyElementUI(page.selStateId, "selectTextStatus-" + elementId);
		}
	}

	@Test
	public void testRadioButtonTooltip() {
		String elementId = page.radioBtn4Id;

		showToolTip(elementId + page.radioIdSuffix, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		Actions action = new Actions(driver);
		List<WebElement> eList = page.radioButtons;
		int idx = 0;

		for (WebElement element : eList) {
			String elementId = element.getAttribute("id");
			idx = page.position(elementId);

			if (elementId.equals(page.radioBtn4Id) || elementId.equals(page.radioBtn7Id)
					|| elementId.equals(page.radioBtn10Id)) {
				userAction.mouseClickStartPoint(driver);
				if (elementId.equals(page.radioBtn4Id)) {
					action.sendKeys(Keys.TAB, Keys.TAB).perform();
				} else if (elementId.equals(page.radioBtn7Id)) {
					action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();
				} else {
					action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();
				}

				verifyElementUI("target" + idx, "KB-Focus-" + elementId);
				action.sendKeys(Keys.SPACE).perform();

				verifyElementUI("target" + idx, "KB-SPACE-" + elementId);
				if (elementId.equals(page.radioBtn10Id)) {
					verifyElementUI(page.selStateId, "KBEvent-SPACE-" + elementId);
				}
			}
		}
	}

}
