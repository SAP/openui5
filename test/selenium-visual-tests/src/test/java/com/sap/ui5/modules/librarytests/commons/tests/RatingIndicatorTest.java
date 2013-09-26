package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.RatingIndicatorPO;
import com.sap.ui5.selenium.common.TestBase;

public class RatingIndicatorTest extends TestBase {

	private RatingIndicatorPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/RatingIndicator.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, RatingIndicatorPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testClickAction() {
		String elementId = page.normalId;

		// ------------ Click on progressIndicator ------------
		mouseOverAndClickAction(elementId, 1, "Up");

		mouseOverAndClickAction(elementId, 3, "Up");

		mouseOverAndClickAction(elementId, 5, "Up");

		mouseOverAndClickAction(elementId, 3, "Down");

		mouseOverAndClickAction(elementId, 1, "Down");
	}

	@Test
	public void testKeyboardActions() {
		String elementId = page.altId;
		String ratingId = page.AltRatingId;
		String RORatingId = page.AltRORatingId;

		userAction.mouseClickStartPoint(driver);
		if (elementId.equals(page.normalId)) {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 1);
		} else {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 3);
		}
		page.pressOneKey(userAction, KeyEvent.VK_UP, 3);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-Up-" + elementId);
		page.pressOneKey(userAction, KeyEvent.VK_ENTER, 1);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-Up-ENTER-" + elementId);
		verifyElementUI(page.currentRatingId, "Rating-KB-Up-ENTER-" + elementId);
		verifyElementUI(RORatingId, "KB-Up-ENTER-" + RORatingId);

		page.pressOneKey(userAction, KeyEvent.VK_RIGHT, 2);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-Right-" + elementId);
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-Right-SPACE-" + elementId);
		verifyElementUI(page.currentRatingId, "Rating-KB-Right-SPACE-" + elementId);
		verifyElementUI(RORatingId, "KB-Right-SPACE-" + RORatingId);

		page.pressOneKey(userAction, KeyEvent.VK_LEFT, 2);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-LEFT-" + elementId);

		if (elementId.equals(page.normalId)) {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		} else {
			page.pressTwoKey(userAction, KeyEvent.VK_SHIFT, KeyEvent.VK_TAB, 2);
		}
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-Left-TAB-" + elementId);
		verifyElementUI(page.currentRatingId, "Rating-KB-Left-TAB-" + elementId);
		verifyElementUI(RORatingId, "KB-Left-TAB-" + RORatingId);

		if (elementId.equals(page.normalId)) {
			page.pressTwoKey(userAction, KeyEvent.VK_SHIFT, KeyEvent.VK_TAB, 2);
		} else {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		}

		page.pressOneKey(userAction, KeyEvent.VK_END, 1);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-End-" + elementId);
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-End-SPACE-" + elementId);
		verifyElementUI(page.currentRatingId, "Rating-KB-End-SPACE-" + elementId);
		verifyElementUI(RORatingId, "KB-End-SPACE-" + RORatingId);

		page.pressOneKey(userAction, KeyEvent.VK_HOME, 1);
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-HOME-" + elementId);

		if (elementId.equals(page.normalId)) {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		} else {
			page.pressTwoKey(userAction, KeyEvent.VK_SHIFT, KeyEvent.VK_TAB, 2);
		}
		waitForReady(page.millisecond);
		verifyElementUI(ratingId, "KB-Home-SHIFTTAB-" + elementId);
		verifyElementUI(page.currentRatingId, "Rating-KB-Home-SHIFTTAB-" + elementId);
		verifyElementUI(RORatingId, "KB-Home-SHIFTTAB-" + RORatingId);
	}

	@Test
	public void testRatingIndicatorTooltip() {
		String elementId = page.normalROId;
		page.showToolTip(driver, userAction, elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
		userAction.mouseMoveToStartPoint(driver);

		elementId = page.oContRating1Item1Id;
		page.showToolTip(driver, userAction, elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

	public void mouseOverAndClickAction(String elementId, int itemNumber, String status) {
		String itemId = elementId + page.itemSuffix + itemNumber;
		String ratingId = page.NormalRatingId;
		String RORatingId = page.NormalRORatingId;

		userAction.mouseClick(driver, itemId);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(page.millisecond);

		verifyElementUI(ratingId, "Mouse-Click-" + status + "-" + itemNumber + "-" + elementId);
		verifyElementUI(page.currentRatingId, "Rating-Mouse-Click-" + status + "-" + itemNumber + "-" + elementId);
		verifyElementUI(RORatingId, "Mouse-Click-" + status + "-" + itemNumber + "-" + RORatingId);
	}

}
