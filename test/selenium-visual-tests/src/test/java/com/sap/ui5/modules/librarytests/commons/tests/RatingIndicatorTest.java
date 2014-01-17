package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.RatingIndicatorPO;
import com.sap.ui5.selenium.common.TestBase;

public class RatingIndicatorTest extends TestBase {

	private RatingIndicatorPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/RatingIndicator.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, RatingIndicatorPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
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
		verifyElement(ratingId, "KB-Up-" + elementId);
		page.pressOneKey(userAction, KeyEvent.VK_ENTER, 1);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-Up-ENTER-" + elementId);
		verifyElement(page.currentRatingId, "Rating-KB-Up-ENTER-" + elementId);
		verifyElement(RORatingId, "KB-Up-ENTER-" + RORatingId);

		page.pressOneKey(userAction, KeyEvent.VK_RIGHT, 2);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-Right-" + elementId);
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-Right-SPACE-" + elementId);
		verifyElement(page.currentRatingId, "Rating-KB-Right-SPACE-" + elementId);
		verifyElement(RORatingId, "KB-Right-SPACE-" + RORatingId);

		page.pressOneKey(userAction, KeyEvent.VK_LEFT, 2);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-LEFT-" + elementId);

		if (elementId.equals(page.normalId)) {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		} else {
			page.pressTwoKey(userAction, KeyEvent.VK_SHIFT, KeyEvent.VK_TAB, 2);
		}
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-Left-TAB-" + elementId);
		verifyElement(page.currentRatingId, "Rating-KB-Left-TAB-" + elementId);
		verifyElement(RORatingId, "KB-Left-TAB-" + RORatingId);

		if (elementId.equals(page.normalId)) {
			page.pressTwoKey(userAction, KeyEvent.VK_SHIFT, KeyEvent.VK_TAB, 2);
		} else {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		}

		page.pressOneKey(userAction, KeyEvent.VK_END, 1);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-End-" + elementId);
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-End-SPACE-" + elementId);
		verifyElement(page.currentRatingId, "Rating-KB-End-SPACE-" + elementId);
		verifyElement(RORatingId, "KB-End-SPACE-" + RORatingId);

		page.pressOneKey(userAction, KeyEvent.VK_HOME, 1);
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-HOME-" + elementId);

		if (elementId.equals(page.normalId)) {
			page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		} else {
			page.pressTwoKey(userAction, KeyEvent.VK_SHIFT, KeyEvent.VK_TAB, 2);
		}
		waitForReady(page.millisecond);
		verifyElement(ratingId, "KB-Home-SHIFTTAB-" + elementId);
		verifyElement(page.currentRatingId, "Rating-KB-Home-SHIFTTAB-" + elementId);
		verifyElement(RORatingId, "KB-Home-SHIFTTAB-" + RORatingId);
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

		verifyElement(ratingId, "Mouse-Click-" + status + "-" + itemNumber + "-" + elementId);
		verifyElement(page.currentRatingId, "Rating-Mouse-Click-" + status + "-" + itemNumber + "-" + elementId);
		verifyElement(RORatingId, "Mouse-Click-" + status + "-" + itemNumber + "-" + RORatingId);
	}

}
