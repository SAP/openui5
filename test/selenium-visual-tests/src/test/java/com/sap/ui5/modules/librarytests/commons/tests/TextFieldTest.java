package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.TextFieldPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.UI5Timeout;

public class TextFieldTest extends TestBase {

	private TextFieldPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/TextField.html";

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(20 * 60 * 1000); // 20 minutes

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TextFieldPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testClickAction() {
		Actions action = new Actions(driver);
		String elementId = page.textField2Id;

		// ------------ Click On TextField2 --------------
		driver.findElement(By.id(elementId)).click();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		verifyElementUI(elementId, "Click-" + elementId);
	}

	@Test
	public void testDoubleClickAction() {
		String elementId = page.textField3Id;

		userAction.mouseDoubleClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(elementId, "DoubleClick-" + elementId);
	}

	@Test
	public void testKeyboardActions() {
		Actions action = new Actions(driver);
		String elementId = page.textField4Id;
		WebElement element = driver.findElement(By.id(elementId));
		userAction.mouseClickStartPoint(driver);

		action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.TAB).perform();
		verifyElementUI(elementId, "KB-Focus-" + elementId);

		// -------------- Press cursor key "Enter" --------------
		element.sendKeys("[ENTER] New content for textfield " + elementId);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_A);
		verifyElementUI(elementId, "KB-ENTER-" + elementId);
		verifyElementUI("currentText", "KBEventOnENTER-" + elementId);

		// ------------ Press cursor key "Tab" --------------
		element.sendKeys("[TAB] New content for textfield " + elementId);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		waitForReady(page.millisecond);
		verifyElementUI(elementId, "KB-TAB-" + elementId);
		verifyElementUI("currentText", "KBEventOnTAB-" + elementId);

		// ------------ Press cursor key "Escape" --------------
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		element.sendKeys("This text should not be visible!");
		action.sendKeys(Keys.ESCAPE).perform();
		action.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		verifyElementUI(elementId, "KB-ESCAPE-" + elementId);
	}

	@Test
	public void testTabShiftAction() {
		Actions action = new Actions(driver);

		userAction.mouseClickStartPoint(driver);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB), Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		verifyFullPageUI("DisabledReadonlyNotFocused");
	}

	@Test
	public void testCopyAndPaste() {
		WebElement textField2 = driver.findElement(By.id(page.textField2Id));

		textField2.click();
		textField2.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		textField2.sendKeys(Keys.chord(Keys.CONTROL, "c"));
		verifyElementUI(page.textField2Id, "copyTextFieldContent-" + page.textField2Id);

		textField2.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
		waitForReady(page.millisecond);

		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_V);
		waitForReady(page.millisecond);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.textField1Id, "pasteCopiedText-" + page.textField1Id);
		verifyElementUI("currentText", "checkEvent-pasteCopiedText-currentText");
	}

	@Test
	public void testCutAndPaste() {
		WebElement textField2 = driver.findElement(By.id(page.textField2Id));

		textField2.click();
		textField2.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		textField2.sendKeys(Keys.chord(Keys.CONTROL, "x"));
		textField2.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB));
		waitForReady(page.millisecond);

		verifyElementUI("currentText", "checkEvent-cutText-currentText");

		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_V);
		waitForReady(page.millisecond);
		userAction.mouseClickStartPoint(driver);

		// Avoid twinkle of textArea border on IE9
		if (getBrowserType() != Constants.IE9 && getBrowserType() != Constants.IE10) {
			verifyElementUI(page.textField2Id, "cutTextFieldContent-" + page.textField2Id);
		}
		verifyElementUI(page.textField1Id, "pasteCutText-" + page.textField1Id);
		verifyElementUI("currentText", "checkEvent-pasteCutText-currentText");
	}

	@Test
	public void testLiveValueOfTextfield() {
		Actions action = new Actions(driver);

		driver.findElement(By.id(page.lvTextFieldId)).click();
		action.sendKeys("A").perform();
		verifyElementUI("currentText", "liveChangeEvent1-currentText");
		action.sendKeys("B").perform();
		verifyElementUI("currentText", "liveChangeEvent2-currentText");
		action.sendKeys("C").perform();
		verifyElementUI("currentText", "liveChangeEvent3-currentText");
	}

	@Test
	public void testTextFieldTooltip() {
		String elementId = page.textField1Id;

		page.showTooltip(driver, userAction, elementId);
		waitForReady(1000);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

}
