package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.CheckBoxPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class CheckBoxTest extends TestBase {

	private CheckBoxPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/CheckBox.html";

	private int waitMilliseconds = 1000;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, CheckBoxPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testToolTip() {
		// toolTip on checkBox1
		showToolTip(page.chkBox1CBId, waitMilliseconds);
		if (getBrowserType() == Constants.CHROME) {
			userAction.mouseMoveToStartPoint(driver);
			showToolTip(page.chkBox1CBId, waitMilliseconds);
		}
		verifyBrowserViewBox(page.chkBox1CBId + "-tooltip");

		// toolTip on checkBox3
		String checkBox3Id = page.checkBox3.getAttribute("id");
		// fix IE cannot show toolTip
		new Actions(driver).moveToElement(page.checkBox3).perform();
		showToolTip(checkBox3Id, waitMilliseconds);
		verifyBrowserViewBox(checkBox3Id + "-Label-tooltip");
	}

	@Test
	public void testClickAction() {
		// Avoid generating no dashed on FIREFOX
		new Actions(driver).sendKeys(Keys.TAB).perform();

		String checkBox6Id = page.checkBox6.getAttribute("id");
		// Click on CheckBox label
		userAction.mouseClick(driver, page.checkBox6.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.targetArea6Id, checkBox6Id + "-Mouse-Click1");
		verifyElement(page.ckdStateId, checkBox6Id + "-MouseEvent-Click1");

		// Click on CheckBox
		userAction.mouseClick(driver, page.checkBox6CB.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.targetArea6Id, checkBox6Id + "-Mouse-Click2");
		verifyElement(page.ckdStateId, checkBox6Id + "-MouseEvent-Click2");

	}

	@Test
	public void testTextSelection() {
		// Avoid generating no dashed on FIREFOX
		new Actions(driver).sendKeys(Keys.TAB).perform();

		page.dragDropOnCheckBox3(driver, userAction);
		verifyElement(page.targetArea3Id, page.checkBox3.getAttribute("id") + "-selectText");
	}

	@Test
	public void testKeyboardAction() {
		String checkBox12Id = page.checkBox12.getAttribute("id");
		userAction.mouseClickStartPoint(driver);
		// Focus chkBox12
		page.pressOneKey(userAction, KeyEvent.VK_TAB, 8);
		verifyElement(page.targetArea12Id, checkBox12Id + "-KB-Focus");

		// Check CheckBox with Space key
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		verifyElement(page.targetArea12Id, checkBox12Id + "-KB-SPACE1");
		verifyElement(page.ckdStateId, checkBox12Id + "-KBEvent-SPACE1");

		// UnCheck CheckBox with Space key
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		verifyElement(page.targetArea12Id, checkBox12Id + "-KB-SPACE2");
		verifyElement(page.ckdStateId, checkBox12Id + "-KBEvent-SPACE2");
	}

}
