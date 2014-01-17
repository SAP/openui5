package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.TextViewPO;
import com.sap.ui5.selenium.common.TestBase;

public class TextViewTest extends TestBase {

	private TextViewPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/TextView.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TextViewPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		waitForReady(2000);
		verifyPage("full-initial");
	}

	@Test
	public void testTextViewTooltip() {
		String elementId = page.textView1Id;

		showToolTip(elementId, page.millisecond);
		verifyBrowserViewBox("Tooltip-" + elementId);
	}

	@Test
	public void testDoubleClickAction() {
		String elementId = page.textView3Id;

		// ------------ Selected text on mouse double-click --------------
		userAction.mouseDoubleClick(driver, page.textView3Id);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(elementId, "DoubleClick-" + elementId);
	}

	@Test
	public void testChangeTextEvent() {
		verifyElement(page.textView10Id, "beforeChanging-" + page.textView10Id);
		driver.findElement(By.id(page.textFieldId)).sendKeys("Changed text for TextView10");

		verifyElement(page.textView10Id, "afterChanging-" + page.textView10Id);
	}

}
