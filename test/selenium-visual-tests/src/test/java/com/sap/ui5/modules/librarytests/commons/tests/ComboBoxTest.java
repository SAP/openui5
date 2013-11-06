package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ComboBoxPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.UI5Timeout;

public class ComboBoxTest extends TestBase {

	private ComboBoxPO page;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/ComboBox.html";

	private final int waitMilliseconds = 1000;

	private final long timeOutSeconds = 10;

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(15 * 60 * 1000); // 15 minutes

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ComboBoxPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testTooltip() {
		// Check toolTip on comboBox6
		showToolTip(page.myCombo6Id, waitMilliseconds);
		verifyBrowserViewBox(page.myCombo6Id + "-toolTip");
	}

	@Test
	public void testAddItems() {
		String[] items = new String[] { "There", "are", "new", "items" };
		String selectAll = Keys.chord(Keys.CONTROL, "a");
		for (String item : items) {
			page.cmb9Input.sendKeys(selectAll, item);
			userAction.pressOneKey(KeyEvent.VK_ENTER);
		}
		userAction.mouseClick(driver, page.cmb9Icon.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.cmb9LbId, "addedListboxItems");

		userAction.mouseClick(driver, page.cmb9LbI1.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.cmb9Id, "selectedAddedListboxItem");
	}

	@Test
	public void testKeyboardActionByTab() {
		String myCombo1Id = page.myCombo.getAttribute("id");
		userAction.pressOneKey(KeyEvent.VK_TAB);

		userAction.pressOneKey(KeyEvent.VK_DOWN);
		verifyElement(myCombo1Id, myCombo1Id + "-focus");

		userAction.pressOneKey(KeyEvent.VK_ENTER);

		verifyElement(page.myTextId, myCombo1Id + "-checkEvent1");

		userAction.pressOneKey(KeyEvent.VK_F4);
		userAction.pressOneKey(KeyEvent.VK_END);
		userAction.pressOneKey(KeyEvent.VK_ESCAPE);
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
		verifyElement(myCombo1Id, myCombo1Id + "-ESCAPE");
	}

	@Test
	public void testSelectAllAction() {
		String myCombo1Id = page.myCombo.getAttribute("id");
		userAction.pressOneKey(KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_DOWN);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		userAction.mouseClickStartPoint(driver);

		// Check select all text after click
		userAction.mouseClick(driver, myCombo1Id);
		userAction.mouseMoveToStartPoint(driver);
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
		verifyElement(myCombo1Id, myCombo1Id + "-click");
	}

	@Test
	public void testMouseActionOnItemsInListBox() {
		String myCombo7Id = page.myCombo7.getAttribute("id");

		// Open listBox by clicking on dropDown icon
		userAction.mouseClick(driver, page.myCombo7Icon.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		waitForElement(driver, true, page.myList.getAttribute("id"), timeOutSeconds);
		verifyElement(page.myList.getAttribute("id"), myCombo7Id + "-listbox");

		// Check rendering of list items
		if (page.myListItems.isEmpty()) {
			return;
		}

		WebElement lastElement = page.myListItems.get(page.myListItems.size() - 1);

		String lastElementId = lastElement.getAttribute("id");
		page.scroll(driver, page.myList.getAttribute("id"));
		verifyElement(page.myList.getAttribute("id"), myCombo7Id + "-lastListEntry");

		userAction.mouseClick(driver, lastElementId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(myCombo7Id, myCombo7Id + "-selectedLastListEntry");
		verifyElement(page.cmb6And7TargetId, myCombo7Id + "-checkEvent2");
	}

	@Test
	public void testKeyNavigationInComboBox() {
		Actions actions = new Actions(driver);
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.TAB).perform();

		// Open listBox by using "F4"
		actions.sendKeys(Keys.F4).perform();
		// Close listBox by using "F4"
		actions.sendKeys(Keys.F4).perform();

		String myCombo1Id = page.myCombo.getAttribute("id");
		int count = page.myListItems.size();
		for (int i = 0; i < count; i++) {
			actions.sendKeys(Keys.DOWN).perform();
			if (i == 0 || i == count - 1) {
				verifyElement(myCombo1Id, "comboboxEntrySelectedByKey-" + i + "-" + myCombo1Id);
			}
		}
		actions.sendKeys(Keys.TAB).perform();
		verifyElement(page.myTextId, myCombo1Id + "-checkEvent3");
	}

	@Test
	public void testKeyNavigationInListbox() {
		Actions actions = new Actions(driver);
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.TAB).perform();

		// Open listBox by using "F4"
		actions.sendKeys(Keys.F4).perform();
		waitForElement(driver, true, page.myList.getAttribute("id"), timeOutSeconds);

		String myCombo1Id = page.myCombo.getAttribute("id");
		int count = page.myListItems.size();
		String listId = page.myList.getAttribute("id");
		for (int i = 0; i < count; i++) {
			actions.sendKeys(Keys.DOWN).perform();
			if (i == 0 || i == count - 1) {
				verifyElement(listId, myCombo1Id + "-entry" + i);
				verifyElement(myCombo1Id, "listboxItemSelectedByKey-" + i + "-" + myCombo1Id);
			}
		}

		// Close listBox by using "F4"
		actions.sendKeys(Keys.F4).perform();
		actions.sendKeys(Keys.TAB).perform();
		verifyElement(page.myTextId, myCombo1Id + "-checkEvent4");
	}

	@Test
	public void testValueSuggestionInComboBox() {
		String myCombo1Id = page.myCombo.getAttribute("id");
		userAction.mouseClick(driver, page.myComboInput.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);

		page.myComboInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		page.myComboInput.sendKeys("a");
		waitForReady(waitMilliseconds);
		verifyElement(myCombo1Id, myCombo1Id + "-comboboxEntryValueSuggestion1");

		page.myComboInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		page.myComboInput.sendKeys("ab");
		waitForReady(waitMilliseconds);
		verifyElement(myCombo1Id, myCombo1Id + "-comboboxEntryValueSuggestion2");

		userAction.mouseClickStartPoint(driver);
		verifyElement(page.myTextId, myCombo1Id + "-checkEvent5");

	}

	@Test
	public void testValueSuggestionInListbox() {
		Actions actions = new Actions(driver);
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.TAB).perform();

		// Open listBox by using "ALT+DOWN". Actions "ALT+DOWN" cannot work on IE9
		String myCombo1Id = page.myCombo.getAttribute("id");
		userAction.pressTwoKeys(KeyEvent.VK_ALT, KeyEvent.VK_DOWN);
		waitForElement(driver, true, page.myList.getAttribute("id"), timeOutSeconds);
		verifySendKeysToInputElement("b", "bb", "bbc");

		// Close listBox by using "ALT+UP". Actions and userAction "ALT+UP" cannot work on IE9, IE10
		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			actions.sendKeys(Keys.F4).perform();
		}
		else {
			actions.sendKeys(Keys.chord(Keys.ALT, Keys.UP)).perform();
		}
		actions.sendKeys(Keys.TAB).perform();
		verifyElement(page.myTextId, myCombo1Id + "-checkEvent6");
	}

	@Test
	public void testComboBoxEvents() {
		// ------- Check event, when selecting Value from comboBox1 using keyboard -------
		userAction.mouseClick(driver, page.myComboInput.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		String selectAll = Keys.chord(Keys.CONTROL, "a");
		page.myComboInput.sendKeys(selectAll, "individual text");
		waitForReady(waitMilliseconds);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		// mark the whole text in order to make the cursor disappear,
		// which might lead to problem when comparing bitmaps
		page.myComboInput.sendKeys(selectAll);
		verifyEventForMyCombo1("-checkEventCombobox1", "-checkEvent7");

		page.myComboInput.sendKeys("b");
		waitForReady(waitMilliseconds);
		verifyElement(page.myCombo.getAttribute("id"), page.myCombo.getAttribute("id") + "-checkEventCombobox2");
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(page.myTextId, page.myCombo.getAttribute("id") + "-checkEvent8");

		userAction.mouseClick(driver, page.myComboIcon.getAttribute("id"));
		userAction.mouseClick(driver, page.myListIb6.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyEventForMyCombo1("-checkEventCombobox3", "-checkEvent9");

		userAction.mouseClick(driver, page.myComboInput.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		page.myComboInput.sendKeys(selectAll, "TAB event", Keys.TAB);
		verifyEventForMyCombo1("-checkEventCombobox4", "-checkEvent10");

		// ------- Check event, when selecting Value from listBox using keyboard -------
		Actions actions = new Actions(driver);
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.TAB, Keys.F4).perform();
		waitForElement(driver, true, page.myList.getAttribute("id"), timeOutSeconds);

		// Select value from listBox using "ENTER" key
		actions.sendKeys(selectAll, "ab").perform();
		waitForReady(waitMilliseconds);
		verifyElement(page.myCombo.getAttribute("id"), page.myCombo.getAttribute("id") + "-checkEventCombobox-onEnter");
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(page.myTextId, page.myCombo.getAttribute("id") + "-checkEvent11");

		// Select value from listBox using "TAB" key
		actions.sendKeys(selectAll, "bb").perform();
		waitForReady(waitMilliseconds);
		actions.sendKeys(Keys.TAB).perform();
		verifyEventForMyCombo1("-checkEventCombobox-onTab", "-checkEvent12");
	}

	private void verifySendKeysToInputElement(CharSequence... keys) {
		String myComboBox1Id = page.myCombo.getAttribute("id");
		String listId = page.myList.getAttribute("id");
		int count = 1;
		for (CharSequence key : keys) {
			page.myComboInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
			page.myComboInput.sendKeys(key);
			waitForReady(waitMilliseconds);
			page.myComboInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
			verifyElement(myComboBox1Id, myComboBox1Id + "-listboxEntryValueSuggestion" + count);
			verifyElement(listId, myComboBox1Id + "-" + listId + "-listboxEntryValueSuggestion" + count);
			count++;
		}
	}

	private void verifyEventForMyCombo1(String imageNameForCombo, String imageNameForOutPutArea) {
		String myCombo1Id = page.myCombo.getAttribute("id");
		verifyElement(myCombo1Id, myCombo1Id + imageNameForCombo);
		verifyElement(page.myTextId, myCombo1Id + imageNameForOutPutArea);
	}

}
