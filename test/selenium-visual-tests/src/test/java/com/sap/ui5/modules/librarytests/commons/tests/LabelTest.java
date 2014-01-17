package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.LabelPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class LabelTest extends TestBase {

	private LabelPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/Label.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, LabelPO.class);
		loadPage(targetUrl);
	}

	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	@Test
	public void testMouseOverAction() {
		String elementId = page.label5.getAttribute("id");
		// Avoid twinkling of button on IE9, IE10
		userAction.mouseMove(driver, elementId);
		verifyElement(page.targetLabeledForId, elementId + "-MouseOver");
	}

	@Test
	public void testClickAction() {
		String elementId = page.label5.getAttribute("id");

		// Label click on #label5
		userAction.mouseClick(driver, elementId);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.targetLabeledForId, elementId + "-Mouse-Click");
	}

	@Test
	public void testDoubleClickAction() {
		String elementId = page.label5.getAttribute("id");

		// Label Double Click on #label5
		if (getBrowserType() == Constants.CHROME || getBrowserType() == Constants.IE10 || getBrowserType() == Constants.IE11) {
			new Actions(driver).doubleClick(page.label5).perform();
		} else {
			userAction.mouseDoubleClick(driver, elementId);
			userAction.mouseMoveToStartPoint(driver);
		}
		verifyElement(page.targetLabeledForId, elementId + "-Double-Mouse-Click");
	}

	@Test
	public void testMouseSelectedAndDragDropAction() {
		// Drag + Drop and Mouse Selection on #label5
		page.dragDrop(driver, userAction, page.label5);
		String elementId = page.label5.getAttribute("id");
		verifyElement(elementId, elementId + "-Mouse-Drag-Drop-Selection");
	}

}
