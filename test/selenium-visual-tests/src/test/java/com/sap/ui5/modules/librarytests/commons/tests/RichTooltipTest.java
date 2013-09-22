package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.RichTooltipPO;
import com.sap.ui5.selenium.common.TestBase;

public class RichTooltipTest extends TestBase {

	private RichTooltipPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/RichTooltip.html";

	private long timeOutSeconds = 10;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, RichTooltipPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseOverAction() {
		for (WebElement element : page.elementsWithTooltip) {
			String elementId = element.getAttribute("id");
			String tooltipId = elementId + page.richTooltipSuffix;
			if (page.panelRttId.equals(elementId)) {
				userAction.mouseMove(driver, page.panelRttTitleId);
				tooltipId = page.panelRttId + page.richTooltipSuffix;
			} else {
				userAction.mouseMove(driver, elementId);
				waitForElement(driver, true, elementId + page.richTooltipSuffix, timeOutSeconds);
			}
			waitForElement(driver, true, tooltipId, timeOutSeconds);
			verifyElementUI(tooltipId, elementId + "-RTT");
			userAction.mouseMoveToStartPoint(driver);
		}
	}

	@Test
	public void testKeyboardAction() {
		Actions action = new Actions(driver);
		userAction.mouseClickStartPoint(driver);
		action.sendKeys(Keys.TAB).perform();

		// Actions "CONTROL+I" cannot work on IE9
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_I);
		verifyElementUI(page.panelRttId + page.richTooltipSuffix, "KB_RTT_panelRTT");
	}

}
