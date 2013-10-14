package com.sap.ui5.modules.librarytests.ux3.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.NotificationBarPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.util.Constants;

public class NotificationBarTest extends TestBase {

	private NotificationBarPO page;

	private final int timeOutSeconds = 10;

	private final int millisecond = 1000;

	private final String targetUrl = "/test-resources/sap/ui/ux3/visual/NotificationBar.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, NotificationBarPO.class);
		UI5PageFactory.initElements(driver, page);

		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	/** Verify adding and removing messages */
	@Test
	public void testAddRemoveMessage() {
		Actions action = new Actions(driver);
		String barId = page.notificationBar.getAttribute("id");

		// Check click add none message button
		page.noneBtn.click();
		this.waitForElement(driver, true, barId, timeOutSeconds);
		verifyElementUI(barId, "Add-None-Message-" + barId);
		verifyElementUI(page.outPutSpanID, "AddMessage-" + page.outPutSpanID);

		// Check click add information message button
		page.infoBtn.click();
		verifyElementUI(barId, "Add-Information-Message-" + barId);

		String iconId = page.notificationIcon.getAttribute("id");

		// Check mouse over notification bar and notification icon
		if (isIEBrowser()) {
			action.moveToElement(page.notificationIcon).perform();
			userAction.mouseOver(driver, iconId, millisecond);
		} else {
			userAction.mouseOver(driver, iconId, millisecond);
		}
		this.waitForElement(driver, true, page.callOutContID, timeOutSeconds);
		verifyBrowserViewBox("MouseOver-NotifictionBarIcon");
		userAction.mouseClickStartPoint(driver);

		// Check click remove all button
		page.removeAllBtn.click();
		this.waitForElement(driver, false, barId, timeOutSeconds);
		waitForReady(millisecond);
		verifyBrowserViewBox("Remove-All-Messages");
	}

	/** Verify notification bar actions */
	@Test
	public void testNotificationBar() {
		Actions action = new Actions(driver);
		String barId = page.notificationBar.getAttribute("id");

		page.noneBtn.click();
		this.waitForElement(driver, true, barId, timeOutSeconds);
		page.infoBtn.click();
		page.successBtn.click();
		page.warningBtn.click();
		page.errorBtn.click();

		if (isIEBrowser()) {
			action.moveToElement(page.notificationBar).perform();
			userAction.mouseOver(driver, barId, millisecond);
		} else {
			userAction.mouseOver(driver, barId, millisecond);
		}
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		userAction.mouseOver(driver, page.barDown.getAttribute("id"), millisecond);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-BarDown");

		userAction.mouseOver(driver, page.arrowUp.getAttribute("id"), millisecond);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-ArrowUp");

		// Change notification bar bar to large
		userAction.mouseClick(driver, page.arrowUp.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyElementUI(barId, "NotificationBar-to-Large");
		verifyElementUI(page.outPutSpanID, "NotificationBar-to-Large-" + page.outPutSpanID);

		// Check mouse over messages in notification bar
		userAction.mouseOver(driver, page.errorMessageText.getAttribute("id"), millisecond);
		verifyElementUI(barId, "MouseOver-NotificationBar-ErrorMessage");

		// Check clicking to remove message
		page.errorMessageText.click();
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(barId, "Remove-NotificationBar-ErrorMessage");

		if (isIEBrowser()) {
			action.moveToElement(page.notificationBar).perform();
			userAction.mouseOver(driver, barId, millisecond);
		} else {
			userAction.mouseOver(driver, barId, millisecond);
		}
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		userAction.mouseOver(driver, page.arrowDown.getAttribute("id"), millisecond);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-ArrowDown");
		
		// Change notification bar to normal
		userAction.mouseClick(driver, page.arrowDown.getAttribute("id"));
		waitForReady(millisecond);
		verifyElementUI(barId, "NotificationBar-Large-to-Normal");
		verifyElementUI(page.outPutSpanID, "NotificationBar-Large-to-Normal-" + page.outPutSpanID);

		// Change notification bar to minimal
		if (isIEBrowser()) {
			action.moveToElement(page.notificationBar).perform();
			userAction.mouseOver(driver, barId, millisecond);
		} else {
			userAction.mouseOver(driver, barId, millisecond);
		}
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		userAction.mouseClick(driver, page.barDown.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);

		// Check mouse over bar up
		if (isIEBrowser()) {
			action.moveToElement(page.notify).perform();
			this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
			action.moveToElement(page.barUp).perform();
		} else {
			userAction.mouseOver(driver, page.notify.getAttribute("id"), millisecond);
			this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
			userAction.mouseOver(driver, page.barUp.getAttribute("id"), millisecond);
		}
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-BarUp");

		verifyBrowserViewBox("NotificationBar-Normal-to-Minimal");
		verifyElementUI(page.outPutSpanID, "NotificationBar-Max-to-Minimal-" + page.outPutSpanID);

		// Change notification bar to default
		if (isIEBrowser()) {
			action.moveToElement(page.notify).perform();
			this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
			action.moveToElement(page.barUp).perform();
		} else {
			userAction.mouseOver(driver, page.notify.getAttribute("id"), millisecond);
			this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
			userAction.mouseOver(driver, page.barUp.getAttribute("id"), millisecond);
		}
		userAction.mouseClick(driver, page.barUp.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);
		waitForReady(millisecond);
		verifyBrowserViewBox("NotificationBar-Minimal-to-Normal");
		verifyElementUI(page.outPutSpanID, "NotificationBar-Minimal-to-Normal-" + page.outPutSpanID);
	}

	/** Verify messageSelected event listener*/
	@Test
	public void testMessageSelected() {
		page.listener.toggle();
		waitForReady(millisecond);
		verifyBrowserViewBox("MessageSelected-Listener-Selected");

		page.infoBtn.click();
		page.successBtn.click();
		this.waitForElement(driver, true, page.notificationBar.getAttribute("id"), timeOutSeconds);
		userAction.mouseClick(driver, page.successMessageId);
		waitForReady(millisecond);
		verifyElementUI(page.notificationBar.getAttribute("id"), "MessageSelected-Listener-NotSelected");
	}

	/** Check whether the browser is IE */
	private boolean isIEBrowser() {

		if (getBrowserType() == Constants.IE8 || getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			return true;
		}
		return false;
	}
}
