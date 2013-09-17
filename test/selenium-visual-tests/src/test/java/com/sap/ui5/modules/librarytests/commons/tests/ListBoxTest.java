package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ListBoxPO;
import com.sap.ui5.selenium.common.TestBase;

public class ListBoxTest extends TestBase {

	private ListBoxPO page;

	private final String targetUrl = "/test-resources/sap/ui/commons/visual/ListBox.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ListBoxPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Ignore
	@Test
	public void testAllElements() {
		page.allElementsScollTop(driver, this);
		verifyFullPageUI("full-initial");
	}

	@Ignore
	@Test
	public void testTooltip() {
		// Test on listBox1 item1
		page.allElementsScollTop(driver, this);
		userAction.mouseClickStartPoint(driver);

		showToolTip(page.listBox1Item1.getAttribute("id"), page.waitMilliseconds);
		verifyBrowserViewBox(page.listBox1Item1.getAttribute("id") + "-tooltip");
	}

	@Test
	public void testMouseAction() {
		waitForReady(page.waitMilliseconds);
		Actions actions = new Actions(driver);
		String listBox8Id = page.listBox8.getAttribute("id");
		// Move Mouse over ListBox8
		int xOffset = page.listBox8.getSize().width / 2;
		int yOffset = page.listBox8.getSize().height - 5;
		actions.moveToElement(page.listBox8, xOffset, yOffset).perform();
		verifyElementUI(listBox8Id, listBox8Id + "-MouseOver");

		// Click on ListBox8 Items
		actions.click(page.listBox8Item2).perform();
		verifyElementUI(page.selectionId, listBox8Id + "-Event-ClickSecond");

		actions.moveToElement(page.listBox8Item3, 30, 5).click().perform();
		verifyElementUI(page.selectionId, listBox8Id + "-Event-ClickDisabledItem");
	}

	@Test
	public void testKeyboardAction() {
		waitForReady(page.waitMilliseconds);
		userAction.mouseClickStartPoint(driver);
		String listBox8Id = page.listBox8.getAttribute("id");

		page.pressOneKey(userAction, KeyEvent.VK_TAB, 2);
		page.pressOneKey(userAction, KeyEvent.VK_END, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-END");

		page.pressOneKey(userAction, KeyEvent.VK_UP, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-UP");

		page.pressOneKey(userAction, KeyEvent.VK_UP, 1);
		page.pressOneKey(userAction, KeyEvent.VK_SPACE, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-SPACE");
		verifyElementUI(page.selectionId, listBox8Id + "-KBEvent-SPACE");

		page.pressOneKey(userAction, KeyEvent.VK_LEFT, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-LEFT");

		page.pressOneKey(userAction, KeyEvent.VK_HOME, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-HOME");

		page.pressOneKey(userAction, KeyEvent.VK_DOWN, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-DOWN");

		page.pressOneKey(userAction, KeyEvent.VK_ENTER, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-ENTER");
		verifyElementUI(page.selectionId, listBox8Id + "-KBEvent-ENTER");

		page.pressOneKey(userAction, KeyEvent.VK_RIGHT, 1);
		verifyElementUI(listBox8Id, listBox8Id + "-KB-RIGHT");

		// ---------- Check MultiSelection in listBox ----------
		page.pressOneKey(userAction, KeyEvent.VK_HOME, 1);
		page.pressOneKey(userAction, KeyEvent.VK_ENTER, 1);
		userAction.mouseClick(driver, page.listBox8Item1.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		page.pressOneKey(userAction, KeyEvent.VK_DOWN, 1);
		// Actions "CONTROL+SPACE" cannot work on IE9, IE10
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_SPACE);
		verifyElementUI(listBox8Id, listBox8Id + "-MultiSelect-CTRL-SPACE");
		verifyElementUI(page.selectionId, listBox8Id + "-KBEvent-MultiSelect-CTRL-SPACE");

		page.pressOneKey(userAction, KeyEvent.VK_END, 1);
		// Actions "SHIFT+END" cannot work on IE9,IE10
		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_END);
		verifyElementUI(listBox8Id, listBox8Id + "-MultiSelect-SHIFT-ENTER");
		verifyElementUI(page.selectionId, listBox8Id + "-KBEvent-MultiSelect-SHIFT-ENTER");

		page.pressOneKey(userAction, KeyEvent.VK_UP, 2);
		// Actions "CONTROL+ENTER" cannot work on IE9, IE10
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_ENTER);
		verifyElementUI(listBox8Id, listBox8Id + "-MultiSelect-CTRL-ENTER");
		verifyElementUI(page.selectionId, listBox8Id + "-KBEvent-MultiSelect-CTRL-ENTER");

		page.pressOneKey(userAction, KeyEvent.VK_HOME, 1);
		// Actions "SHIFT+SPACE" cannot work on IE9, IE10
		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_SPACE);
		verifyElementUI(listBox8Id, listBox8Id + "-MultiSelect-SHIFT-SPACE");
		verifyElementUI(page.selectionId, listBox8Id + "-KBEvent-MultiSelect-SHIFT-SPACE");
	}

}
