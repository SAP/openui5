package com.sap.ui5.modules.librarytests.ux3.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.NotificationBarPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.util.JsAction;

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
		verifyPage("full-initial");
	}

	/** Verify adding and removing messages */
	@Test
	public void testAddRemoveMessage() {
		Actions action = new Actions(driver);
		String barId = page.notificationBar.getAttribute("id");

		// Check click add none message button
		page.noneBtn.click();
		this.waitForElement(driver, true, barId, timeOutSeconds);
		verifyElement(barId, "Add-None-Message-" + barId);
		verifyElement(page.outPutSpanID, "AddMessage-" + page.outPutSpanID);

		// Check click add information message button
		page.infoBtn.click();
		userAction.mouseClickStartPoint(driver);
		verifyElement(barId, "Add-Information-Message-" + barId);

		// Check mouse over notification bar and notification icon
		waitForReady(millisecond);
		action.moveToElement(page.notificationIcon).perform();
		userAction.mouseOver(driver, page.notificationIcon.getAttribute("id"), millisecond);
		this.waitForElement(driver, true, page.callOutContID, timeOutSeconds);
		waitForReady(600);
		verifyBrowserViewBox("MouseOver-NotifictionBarIcon");
		userAction.mouseMoveToStartPoint(driver);

		// Check click remove all button
		page.removeAllBtn.click();
		waitForReady(800);
		userAction.mouseClickStartPoint(driver);
		waitForReady(1500);
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
		userAction.mouseOver(driver, page.barDown.getAttribute("id"), 800);
		verifyElement(page.togglerID, "MouseOver-NotificationBar-BarDown");

		action.moveToElement(page.notificationBar).perform();
		waitForReady(500);
		userAction.mouseOver(driver, page.arrowUp.getAttribute("id"), 800);
		verifyElement(page.togglerID, "MouseOver-NotificationBar-ArrowUp");

		// Change notification bar bar to large
		JsAction.clickElement(driver, page.arrowUp);
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.noneMessageId);
		verifyElement(barId, "NotificationBar-to-Large");
		verifyElement(page.outPutSpanID, "NotificationBar-to-Large-" + page.outPutSpanID);

		// Check clicking to remove message
		page.errorMessageText.click();
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.warnMessageId);
		verifyElement(barId, "Remove-NotificationBar-ErrorMessage");

		action.moveToElement(page.notificationBar).perform();
		waitForReady(500);
		userAction.mouseOver(driver, page.arrowDown.getAttribute("id"), 800);
		verifyElement(page.togglerID, "MouseOver-NotificationBar-ArrowDown");

		// Change notification bar to normal
		userAction.mouseClick(driver, page.arrowDown.getAttribute("id"));
		waitForReady(millisecond);
		verifyElement(barId, "NotificationBar-Large-to-Normal");
		verifyElement(page.outPutSpanID, "NotificationBar-Large-to-Normal-" + page.outPutSpanID);

		// Change notification bar to minimal
		action.moveToElement(page.notificationBar).perform();
		userAction.mouseMove(driver, barId);
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		userAction.mouseClick(driver, page.barDown.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseClickStartPoint(driver);

		waitForReady(millisecond);
		action.moveToElement(page.notify).perform();
		JsAction.focusOnElement(driver, page.notify);
		userAction.mouseOver(driver, page.notify.getAttribute("id"), millisecond);
		this.waitForElement(driver, true, page.hoverID, timeOutSeconds);
		verifyBrowserViewBox("NotificationBar-Normal-to-Minimal");
		verifyElement(page.outPutSpanID, "NotificationBar-Normal-to-Minimal-" + page.outPutSpanID);

		// Check mouse over bar up
		userAction.mouseOver(driver, page.barUp.getAttribute("id"), 800);
		verifyElement(page.togglerID, "MouseOver-NotificationBar-BarUp");

		// Change notification bar to minimal
		userAction.mouseClick(driver, page.barUp.getAttribute("id"));
		waitForReady(millisecond);
		userAction.mouseMove(driver, page.notificationBar.getAttribute("id"));
		verifyElement(barId, "NotificationBar-Minimal-to-Normal");
		verifyElement(page.outPutSpanID, "NotificationBar-Minimal-to-Normal-" + page.outPutSpanID);
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
		verifyElement(page.notificationBar.getAttribute("id"), "MessageSelected-Listener-RemoveMessage");
	}
}