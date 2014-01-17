package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.ValueHelpFieldPO;
import com.sap.ui5.selenium.common.TestBase;

public class ValueHelpFieldTest extends TestBase {

	private ValueHelpFieldPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/ValueHelpField.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ValueHelpFieldPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testClickAction() {
		String elementId = page.vhField1Id;

		// ------------ Click on ValueHelpField Icon --------------
		// Avoid twinkling on IE9 and IE10
		userAction.mouseClick(driver, elementId + page.iconSuffix);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.outputTargetId, "ClickEvent-" + elementId);
	}

	@Test
	public void testKeyboardAction() {
		Actions action = new Actions(driver);
		String elementId = page.vhField4Id;

		// ------------ Check focused ValueHelpField --------------
		action.sendKeys(Keys.chord(Keys.TAB, Keys.TAB, Keys.TAB)).perform();
		verifyElement(elementId, "KB-Focused-" + elementId);

		// ------------ Check ValueHelp trigger on pressing F4 key --------------
		action.sendKeys(Keys.F4).perform();
		verifyElement(page.outputTargetId, "KB-Event-" + elementId);
	}

	@Test
	public void testValueHelpFieldTooltip() {
		String elementId = page.vhField7Id;

		// ------------ Move Mouse over ValueHelpField Input --------------
		showToolTip(elementId + page.inputSuffix, page.millisecond);
		verifyBrowserViewBox("Tooltip" + elementId + page.inputSuffix);
		userAction.mouseMoveToStartPoint(driver);

		// ------------ Move Mouse over ValueHelpField Icon --------------
		showToolTip(elementId + page.iconSuffix, page.millisecond);
		verifyBrowserViewBox("Tooltip" + elementId + page.iconSuffix);
	}

}
