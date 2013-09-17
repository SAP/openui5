package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.DialogPO;
import com.sap.ui5.selenium.common.TestBase;

public class DialogTest extends TestBase {

	private DialogPO page;

	private final String targetUrl = "/test-resources/sap/ui/commons/visual/Dialog.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, DialogPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseClickAction() {
		// Check dialog #3
		String dialogId = page.myDialog3Id;

		page.openDialogByBtn(driver, userAction, page.button3Id, page.myDialog3Id, this);
		verifyElementUI(dialogId, dialogId + "-Mouse");

		// Click close button
		String closeBtnId = dialogId + page.closeBtnIdSuffix;
		page.closeDialogByBtn(driver, userAction, closeBtnId, dialogId, this);
		verifyElementUI(page.myResultTvId, dialogId + "-Mouse-Close");

		page.openDialogByBtn(driver, userAction, page.button3Id, dialogId, this);

		// Click OK button
		String okBtnId = dialogId + page.okBtnIdSuffix;
		page.closeDialogByBtn(driver, userAction, okBtnId, dialogId, this);
		verifyElementUI(page.myResultTvId, dialogId + "-Mouse-OK");

		page.openDialogByBtn(driver, userAction, page.button3Id, dialogId, this);

		// Click cancel button
		String cancelBtnId = dialogId + page.cancelBtnIdSuffix;
		page.closeDialogByBtn(driver, userAction, cancelBtnId, dialogId, this);
		verifyElementUI(page.myResultTvId, dialogId + "-Mouse-Cancel");

	}

	@Test
	public void testKeyboardAction() {
		Actions actions = new Actions(driver);
		actions.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB).perform();

		// ----------- Check keyboard on dialog #3 ------------
		page.openDialogByEnter(driver, userAction, page.myDialog3Id, this);
		keyboardEventForDialog(actions, page.myDialog3Id, new Object[] { KeyEvent.VK_TAB, KeyEvent.VK_ENTER },
				new Object[] { KeyEvent.VK_SHIFT + "+" + KeyEvent.VK_TAB, KeyEvent.VK_ENTER });

		// ----------- Check keyboard on dialog #5 ------------
		// Open Dialog#5, first open Dialog#3
		page.openDialogByEnter(driver, userAction, page.myDialog3Id, this);
		page.openDialogByEnter(driver, userAction, page.myDialog5Id, this);
		keyboardEventForDialog(actions, page.myDialog5Id, new Object[] { KeyEvent.VK_ENTER }, new Object[] {
				KeyEvent.VK_TAB, KeyEvent.VK_ENTER });
		page.closeDialogByKeyboard(driver, userAction, page.myDialog3Id, this, KeyEvent.VK_ESCAPE);
	}

	@Test
	public void testDragAndDropAction() {
		// ------------- Drag drop on dialog#1 --------------------
		userAction.mouseClick(driver, page.button1Id);
		userAction.mouseMoveToStartPoint(driver);
		waitForElement(driver, true, page.myDialog1Id, page.timeOutSeconds);
		verifyFullPageUI(page.myDialog1Id + "-beforeMove");

		page.dragDrop(driver, userAction, page.myDialog1Id + page.dialogHeaderSuffix, -100, -100);
		waitForElement(driver, true, page.myDialog1Id, page.timeOutSeconds);
		verifyFullPageUI(page.myDialog1Id + "-afterMove");

		int rtlMode = 1;
		if (userAction.getRtl()) {
			rtlMode = -1;
		}
		// ------------- Change size for dialog#1 --------------------
		checkChangeDialogSizeByDragDrop(page.myDialog1Id, rtlMode);

		// ------------- Change size for dialog#2 --------------------
		userAction.mouseClick(driver, page.button2Id);
		userAction.mouseMoveToStartPoint(driver);
		waitForElement(driver, true, page.myDialog2Id, page.timeOutSeconds);
		checkChangeDialogSizeByDragDrop(page.myDialog2Id, rtlMode);

	}

	private void keyboardEventForDialog(Actions actions, String dialogId, Object[] navigateToOK,
			Object[] navigateToCancel) {
		verifyElementUI(dialogId, dialogId + "-KB");

		// Use ESC to close dialog
		page.closeDialogByKeyboard(driver, userAction, dialogId, this, KeyEvent.VK_ESCAPE);
		verifyElementUI(page.myResultTvId, dialogId + "-KB-Close");

		page.openDialogByEnter(driver, userAction, dialogId, this);

		// Navigate back to 'OK' button and confirm
		page.closeDialogByKeyboard(driver, userAction, dialogId, this, navigateToOK);
		verifyElementUI(page.myResultTvId, dialogId + "-KB-OK");

		page.openDialogByEnter(driver, userAction, dialogId, this);

		// Navigate back to 'Cancel' button and confirm
		page.closeDialogByKeyboard(driver, userAction, dialogId, this, navigateToCancel);
		verifyElementUI(page.myResultTvId, dialogId + "-KB-Cancel");
	}

	private void checkChangeDialogSizeByDragDrop(String dialogId, int rtlMode) {
		page.dragDrop(driver, userAction, dialogId + page.dialogGripSuffix, 80 * rtlMode, 80);
		verifyFullPageUI(dialogId + "-bigger");

		page.dragDrop(driver, userAction, dialogId + page.dialogGripSuffix, -25 * rtlMode, -25);
		verifyFullPageUI(dialogId + "-smaller");

		page.closeDialogByKeyboard(driver, userAction, dialogId, this, KeyEvent.VK_ESCAPE);
	}

}
