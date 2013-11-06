package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ProgressIndicatorPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class ProgressIndicatorTest extends TestBase {

	private ProgressIndicatorPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/ProgressIndicator.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ProgressIndicatorPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testMouseOverAction() {
		String elementId = page.progInd1Id;

		// ------------ Move Mouse over ProgressIndicator --------------
		userAction.mouseMove(driver, elementId);
		verifyElement(elementId, "MouseOver-" + elementId);
	}

	@Test
	public void testClickAction() {
		// Avoid generating no dashed on FIREFOX
		new Actions(driver).sendKeys(Keys.TAB).perform();

		String elementId = page.progInd2Id;
		WebElement element = driver.findElement(By.id(elementId));

		// ------------ Click on ProgressIndicator --------------
		element.click();
		verifyElement(page.target2Id, "FocusedWithClick-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		String elementId = page.progInd1Id;

		// ------------ Keyboard navigation for ProgressIndicator --------------
		userAction.pressOneKey(KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		verifyElement(page.target1Id, "KB-FocusOut-" + elementId);

		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_TAB);
		waitForReady(page.millisecond);
		verifyElement(page.target1Id, "KB-FocusIn-" + elementId);
	}

	@Test
	public void testRestorePercentValueEvent() {

		// ------------ Check Progress Indicator Restore , when percentValue switches from >100, <100 percent
		page.oTextFieldId.click();
		page.oTextFieldId.sendKeys("150");
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		// Increase stability on all browsers.
		if (getBrowserType() != Constants.IE8) {
			userAction.mouseClick(driver, page.progInd30Id);
			userAction.mouseClickStartPoint(driver);
		}
		waitForReady(page.millisecond);

		verifyElement(page.progInd30Id, "ValueMoreThan100Percent");

		page.oTextFieldId.click();
		page.oTextFieldId.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		page.oTextFieldId.sendKeys("50");
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		// Increase stability on all browsers.
		if (getBrowserType() != Constants.IE8) {
			userAction.mouseClick(driver, page.progInd30Id);
			userAction.mouseClickStartPoint(driver);
		}
		waitForReady(page.millisecond);

		verifyElement(page.progInd30Id, "ValueLessThan100Percent");
	}

	@Test
	public void testProgressIndicatorTooltip() {
		String elementId = page.progInd4Id;

		showToolTip(elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip" + elementId);
	}

}
