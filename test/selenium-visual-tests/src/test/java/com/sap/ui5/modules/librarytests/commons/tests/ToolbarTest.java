package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ToolbarPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class ToolbarTest extends TestBase {

	private ToolbarPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Toolbar.html";

	private int waitTimeMillsecond = 1000;

	private int timeOutSeconds = 10;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ToolbarPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyBrowserViewBox("full-initial");
	}

	@Test
	public void testTooltip() {
		// --------- Test toolTip on toolBar #tb4 ----------------
		Actions actions = new Actions(driver);
		actions.moveToElement(page.tb4Btn1).perform();

		String btnId = page.tb4Btn1.getAttribute("id");
		showToolTip(btnId, waitTimeMillsecond);
		verifyBrowserViewBox(btnId + "-tooltip");
	}

	@Test
	public void testMouseActions() {
		Actions actions = new Actions(driver);
		// Check mouse action on toolBar #tb5
		String toolBarId = page.tb5Id;

		String btn3Id = toolBarId + page.btn3Suffix;
		vefifyTargetForOutputArea(btn3Id, "IconButton");

		page.openOverflowToolBar(driver, toolBarId, timeOutSeconds, this);
		verifyElement(toolBarId + page.puSuffix, toolBarId + page.puSuffix + "-Mouse-ToolbarOverflow");

		String btn9Id = toolBarId + page.btn9Suffix;
		vefifyTargetForOutputArea(btn9Id, "LabelButton");

		// Enter a string into a textField in the toolBar and check
		userAction.mouseClick(driver, page.tb5TfId);
		userAction.mouseMoveToStartPoint(driver);
		verifyWithSetValueForTextField(actions, toolBarId, "Mouse", page.tb5TfId);

		// Select a value from a comboBox in the toolBar
		userAction.mouseClick(driver, page.tb5CmbIconId);
		userAction.mouseMoveToStartPoint(driver);
		// wait for ListBox
		waitForElement(driver, true, toolBarId + page.cmbSuffix, timeOutSeconds);

		// Define different comboBox items to be selected for each toolBar
		userAction.mouseClick(driver, page.tb5CmbItem1Id);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.targetForOutputId, toolBarId + "-Mouse-combobox");

		// Close overflow
		driver.findElement(By.id(toolBarId + page.mnSuffix)).click();

		// Check toolBar overflow on Window resize
		checkToolBarWhenResizeWindowByMouse();
	}

	@Test
	public void testKeyboardActions() {
		Actions actions = new Actions(driver);

		// Check keyboard action on toolBar #tb1
		actions.sendKeys(Keys.TAB).perform();
		checkToolBarByKeyboard(actions, page.tb1Id, false, page.tb1TfId);

		// Check toolBar in Dialog
		checkToolBarInDialogByKeyboard(actions);

		// Check ToolBar overflow on Window resize
		checkToolBarWhenResizeWindowByKeyboard(actions);

	}

	private void checkToolBarWhenResizeWindowByMouse() {
		if (page.checkThemeIsGoldreflection()) {
			page.resizeWindow(driver, 50, 50, 510, 810);
		} else {
			page.resizeWindow(driver, 50, 50, 420, 750);
		}
		page.checkToolBarOverflowIcons(driver, timeOutSeconds);
		verifyElement(page.tb1Mn.getAttribute("id"), "Mouse-tbOverFlow-afterWindowResize");

		page.tb1Mn.click();
		waitForElement(driver, true, page.tb1Id + page.puSuffix, timeOutSeconds);
		verifyElement(page.tb1PuId, page.tb1Id + "-Mouse-OverFlow-afterWindowResize");
	}

	private void checkToolBarInDialogByKeyboard(Actions actions) {
		// Open dialog with toolBar
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForElement(driver, true, page.dialogId, timeOutSeconds);
		waitForReady(waitTimeMillsecond);
		// Check dialog with toolBar
		verifyElement(page.dialogId, page.dialogId + "-KB-dialogWithToolbar");

		// Check toolBar in the dialog
		actions.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();

		checkToolBarByKeyboard(actions, page.dlgTbId, true, page.dlgTbTfId);

		// Close the dialog
		actions.sendKeys(Keys.TAB).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForElement(driver, false, page.dialogId, timeOutSeconds);
		verifyBrowserViewBox("KB-afterClosingDialog");
	}

	private void checkToolBarByKeyboard(Actions actions, String toolBarId, boolean isInDialog, String textFieldId) {
		// Confirm btn3
		String btn3Id = toolBarId + page.btn3Suffix;
		page.moveToElementByKeyboard(actions, isRtlTrue(), 3);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(btn3Id, btn3Id + "-KB-IconButton-confirmed");
		verifyElement(page.targetForOutputId, btn3Id + "-KB-IconButton-confirmedEvent");

		if (isInDialog) {
			// Open toolBar overflow
			// Press Down fourth on sap_platinum theme only.
			actions.sendKeys(Keys.DOWN, Keys.DOWN, Keys.DOWN).perform();
			if (getThemeType() == Constants.THEME_PLATINUM) {
				actions.sendKeys(Keys.DOWN).perform();
			}
			waitForElement(driver, true, toolBarId + page.puSuffix, timeOutSeconds);
			verifyBrowserViewBox(toolBarId + "-KB-dialogWithToolbarOverflow");
			actions.sendKeys(Keys.DOWN).perform();
			actions.sendKeys(Keys.SPACE).perform();
			actions.sendKeys(Keys.DOWN, Keys.DOWN, Keys.DOWN).perform();
		} else {
			actions.sendKeys(Keys.DOWN, Keys.DOWN, Keys.DOWN, Keys.DOWN, Keys.DOWN, Keys.DOWN).perform();
		}

		// Confirm btn9
		String btn9Id = toolBarId + page.btn9Suffix;
		verifyElement(btn9Id, btn9Id + "-KB-LabelButton-focused");
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(btn9Id, btn9Id + "-KB-LabelButton-confirmed");
		verifyElement(page.targetForOutputId, btn9Id + "-KB-LabelButton-confirmedEvent");

		// Enter a string into a textField in the toolBar and check
		userAction.pressOneKey(KeyEvent.VK_DOWN);
		verifyWithSetValueForTextField(actions, toolBarId, "KB", textFieldId);

		// Select a value from a comboBox in the toolBar
		page.moveToElementByKeyboard(actions, isRtlTrue(), 1);
		// Actions userAction "ALT+DOWN" cannot work on IE9, use "F4" to replace.
		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10 || getBrowserType() == Constants.IE11) {
			userAction.pressOneKey(KeyEvent.VK_F4);
		} else {
			actions.sendKeys(Keys.chord(Keys.ALT, Keys.DOWN)).perform();
		}
		waitForElement(driver, true, toolBarId + "_cmb-lb", timeOutSeconds);
		actions.sendKeys(Keys.DOWN, Keys.DOWN, Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(page.targetForOutputId, toolBarId + "-KB-combobox");
		// Close overflow of toolBar
		if (isInDialog) {
			actions.sendKeys(Keys.ESCAPE).perform();
			waitForElement(driver, false, page.dlgTbId + page.puSuffix, timeOutSeconds);
			verifyElement(toolBarId, toolBarId + "-KB-afterClosingOverflow");
		}
	}

	private void checkToolBarWhenResizeWindowByKeyboard(Actions actions) {
		driver.navigate().refresh();

		if (page.checkThemeIsGoldreflection()) {
			page.resizeWindow(driver, 50, 50, 510, 810);
		} else {
			page.resizeWindow(driver, 50, 50, 420, 750);
		}
		page.checkToolBarOverflowIcons(driver, timeOutSeconds);
		verifyElement(page.tb1Id + page.mnSuffix, "KB-tbOverFlow-afterWindowResize");

		// Check on toolBar #tb1, if toolBar overflow opens correctly
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.TAB).perform();
		actions.sendKeys(Keys.UP).perform();
		actions.sendKeys(Keys.DOWN).perform();
		waitForElement(driver, true, page.tb1Id + page.puSuffix, timeOutSeconds);
		verifyElement(page.tb1PuId, page.tb1Id + "-KB-OverFlow-afterWindowResize");

		// Close
		actions.sendKeys(Keys.ESCAPE).perform();
		waitForElement(driver, false, page.tb1Id + page.puSuffix, timeOutSeconds);
	}

	private void vefifyTargetForOutputArea(String btnId, String desc) {
		userAction.mouseClick(driver, btnId);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(waitTimeMillsecond);
		verifyElement(btnId, btnId + "-Mouse-" + desc + "-Click");
		verifyElement(page.targetForOutputId, btnId + "-Mouse-" + desc + "-clickEvent");
	}

	private void verifyWithSetValueForTextField(Actions actions, String toolBarId, String eventType, String textFieldId) {
		driver.findElement(By.id(textFieldId)).clear();
		actions.sendKeys(toolBarId + " textfield").perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(page.targetForOutputId, toolBarId + "-" + eventType + "-textfield");
	}

}
