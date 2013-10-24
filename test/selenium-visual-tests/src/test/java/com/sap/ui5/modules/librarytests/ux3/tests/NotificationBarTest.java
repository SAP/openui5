package com.sap.ui5.modules.librarytests.ux3.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.NotificationBarPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;

public class NotificationBarTest extends TestBase {

	private NotificationBarPO page;

	private final int timeOutSeconds = 10;

	private final int millisecond = 1000;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/NotificationBar.html";

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
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(barId, "Add-Information-Message-" + barId);

		// Check mouse over notification bar and notification icon
		action.moveToElement(page.notificationIcon).perform();
		userAction.mouseOver(driver, page.notificationIcon.getAttribute("id"), millisecond);
		this.waitForElement(driver, true, page.callOutContID, timeOutSeconds);
		verifyBrowserViewBox("MouseOver-NotifictionBarIcon");
		userAction.mouseMoveToStartPoint(driver);

		// Check click remove all button
		page.removeAllBtn.click();
		waitForReady(500);
		userAction.mouseMove(driver, page.removeAllBtn.getId());
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

		action.moveToElement(page.notificationBar).perform();
		userAction.mouseOver(driver, barId, millisecond);
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		userAction.mouseOver(driver, page.barDown.getAttribute("id"), 500);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-BarDown");

		userAction.mouseOver(driver, page.arrowUp.getAttribute("id"), millisecond);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-ArrowUp");

		// Change notification bar bar to large
		userAction.mouseClick(driver, page.arrowUp.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.noneMessageId);
		verifyElementUI(barId, "NotificationBar-to-Large");
		verifyElementUI(page.outPutSpanID, "NotificationBar-to-Large-" + page.outPutSpanID);

		// Check clicking to remove message
		page.errorMessageText.click();
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.warnMessageId);
		verifyElementUI(barId, "Remove-NotificationBar-ErrorMessage");

		userAction.mouseOver(driver, page.arrowDown.getAttribute("id"), 500);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-ArrowDown");

		// Change notification bar to normal
		userAction.mouseClick(driver, page.arrowDown.getAttribute("id"));
		waitForReady(millisecond);
		verifyElementUI(barId, "NotificationBar-Large-to-Normal");
		verifyElementUI(page.outPutSpanID, "NotificationBar-Large-to-Normal-" + page.outPutSpanID);

		// Change notification bar to minimal
		action.moveToElement(page.notificationBar).perform();
		userAction.mouseMove(driver, barId);
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		userAction.mouseClick(driver, page.barDown.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);

		action.moveToElement(page.notify).perform();
		userAction.mouseOver(driver, page.notify.getAttribute("id"), millisecond);
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		verifyBrowserViewBox("NotificationBar-Normal-to-Minimal");
		verifyElementUI(page.outPutSpanID, "NotificationBar-Normal-to-Minimal-" + page.outPutSpanID);

		// Check mouse over bar up
		userAction.mouseOver(driver, page.barUp.getAttribute("id"), millisecond);
		verifyElementUI(page.togglerID, "MouseOver-NotificationBar-BarUp");

		// Change notification bar to minimal
		userAction.mouseClick(driver, page.barUp.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.notificationBar.getAttribute("id"));
		verifyElementUI(barId, "NotificationBar-Minimal-to-Normal");
		verifyElementUI(page.outPutSpanID, "NotificationBar-Minimal-to-Normal-" + page.outPutSpanID);
	}

	/** Verify messageSelected event listener*/
	@Test
	public void testMessageSelected() {
		page.listener.toggle();
		userAction.mouseMove(driver, page.listener.getId());
		verifyBrowserViewBox("MessageSelected-Listener-Selected");

		page.infoBtn.click();
		page.successBtn.click();
		this.waitForElement(driver, true, page.notificationBar.getAttribute("id"), timeOutSeconds);
		userAction.mouseClick(driver, page.successMessageId);
		verifyElementUI(page.notificationBar.getAttribute("id"), "MessageSelected-Listener-RemoveMessage");
	}
}
