package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.MessageBoxPO;
import com.sap.ui5.modules.librarytests.commons.pages.MessageBoxPO.MessageBoxType;
import com.sap.ui5.selenium.common.TestBase;

public class MessageBoxTest extends TestBase {

	private MessageBoxPO page;

	private final String targetUrl = "/test-resources/sap/ui/commons/visual/MessageBox.html";

	private final long timeOutSeconds = 10;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, MessageBoxPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseAction() {
		// Test Mouse actions on msgBoxShow1
		String boxShow1BtnId = page.boxShow1Btn.getAttribute("id");

		page.boxShow1Btn.click();
		page.waitForMessageBox(driver, true, MessageBoxType.MBOX, timeOutSeconds);
		verifyElementUI(page.alertDialog.getAttribute("id"), boxShow1BtnId + "-Open");

		page.closeBtn.click();
		page.waitForMessageBox(driver, false, MessageBoxType.MBOX, timeOutSeconds);
		verifyCallbackTriggerArea("-Mouse-CloseUsingCloseIcon");

		page.boxShow1Btn.click();
		page.waitForMessageBox(driver, true, MessageBoxType.MBOX, timeOutSeconds);

		// Test all buttons in dialog
		int count = page.dialogBtns.size();
		for (int i = 0; i < count; i++) {
			WebElement btn = page.dialogBtns.get(i);
			String btnName = btn.getText();
			btn.click();
			page.waitForMessageBox(driver, false, MessageBoxType.MBOX, timeOutSeconds);
			verifyCallbackTriggerArea("-Mouse-CloseUsing" + btnName + "Button");
			if (i < count - 1) {
				page.boxShow1Btn.click();
				page.waitForMessageBox(driver, true, MessageBoxType.MBOX, timeOutSeconds);
			}
		}
	}

	@Test
	public void testKeyboardActions() {
		// Test Keyboard actions on msgBoxShow1
		Actions actions = new Actions(driver);
		actions.click(page.boxShow1Btn).perform();
		page.waitForMessageBox(driver, true, MessageBoxType.MBOX, timeOutSeconds);

		// Test ESC close dialog
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.ESCAPE).perform();
		page.waitForMessageBox(driver, false, MessageBoxType.MBOX, timeOutSeconds);
		verifyCallbackTriggerArea("-KB-CloseUsingESCAPE");

		actions.click(page.boxShow1Btn).perform();
		page.waitForMessageBox(driver, true, MessageBoxType.MBOX, timeOutSeconds);
		userAction.mouseClickStartPoint(driver);

		// Test all buttons in dialog by using keyboard
		int count = page.dialogBtns.size();
		for (int i = 0; i < count; i++) {
			WebElement btn = page.dialogBtns.get(i);
			String btnName = btn.getText();
			for (int j = 1; j <= i; j++) {
				actions.sendKeys(Keys.TAB).perform();
			}
			if (i % 2 == 0) {
				actions.sendKeys(Keys.SPACE).perform();
				page.waitForMessageBox(driver, false, MessageBoxType.MBOX, timeOutSeconds);
				verifyCallbackTriggerArea("-KB-CloseUsingSpaceKeyOn" + btnName + "Button");
			} else {
				userAction.pressOneKey(KeyEvent.VK_ENTER);
				page.waitForMessageBox(driver, false, MessageBoxType.MBOX, timeOutSeconds);
				verifyCallbackTriggerArea("-KB-CloseUsingEnterKeyOn" + btnName + "Button");
			}

			if (i < count - 1) {
				actions.click(page.boxShow1Btn).perform();
				page.waitForMessageBox(driver, true, MessageBoxType.MBOX, timeOutSeconds);
				userAction.mouseClickStartPoint(driver);
			}
		}
	}

	@Test
	public void testDragAndDrop() {
		String alert1BtnId = page.alert1Btn.getAttribute("id");
		userAction.mouseClick(driver, alert1BtnId);
		page.waitForMessageBox(driver, true, MessageBoxType.ALERT, timeOutSeconds);
		userAction.mouseClickStartPoint(driver);
		verifyFullPageUI(alert1BtnId + "-beforeMove");

		page.dragDrop(driver, userAction, page.dragBar.getAttribute("id"), -100, -50);
		verifyFullPageUI(alert1BtnId + "-afterMove");

		page.closeBtn.click();
		page.waitForMessageBox(driver, false, MessageBoxType.ALERT, timeOutSeconds);
	}

	private void verifyCallbackTriggerArea(String imageName) {
		String boxShow1BtnId = page.boxShow1Btn.getAttribute("id");
		verifyElementUI(page.callbackTriggerId, boxShow1BtnId + imageName);
	}

}
