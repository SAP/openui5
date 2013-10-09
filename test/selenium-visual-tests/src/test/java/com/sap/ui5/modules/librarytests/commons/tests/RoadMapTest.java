package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.RoadMapPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.JsAction;

public class RoadMapTest extends TestBase {

	private RoadMapPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/RoadMap.html";

	private int waitMilliseconds = 1000;

	private int timeOutSeconds = 10;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, RoadMapPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testTooltip() {
		int count = 0;
		// Test toolTip of roadMap1
		page.showTooltip(driver, userAction, page.roadMap1Id, waitMilliseconds);
		verifyBrowserViewBox(page.roadMap1Id + "-tooltip");

		// Test toolTip of first six steps of roadMap1
		userAction.mouseClick(driver, page.roadMap1Id +  "_s4");
		userAction.mouseClickStartPoint(driver);
		List<WebElement> boxElements = page.getSubStepBoxElements(driver, page.roadMap1Id);
		for (WebElement boxElement : boxElements) {
			WebElement parentElement = page.findBoxParentElement(boxElement);
			if (!page.isVisible(parentElement)) {
				continue;
			}
			if (count > 4)
				break;
			String boxId = boxElement.getAttribute("id");
			if (getBrowserType() != Constants.CHROME) {
				JsAction.focusOnElement(driver, boxElement);
				userAction.mouseMoveToStartPoint(driver);
			}
			userAction.mouseOver(driver, boxId, waitMilliseconds);
			verifyBrowserViewBox(boxId + "-tooltip");
			count++;
		}
	}

	@Test
	public void testMouseActions() {
		// Check mouse actions on roadMap2
		// If the first visible step is not the beginning of the roadMap, navigate back
		WebElement startElement = page.startElement;
		String startElementId = startElement.getAttribute("id");
		while (startElement.getAttribute("class").contains(page.startScrollClassName)) {
			userAction.mouseClick(driver, startElementId);
		}
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-StartOfRoadMap");

		// Click on label of Step #1
		userAction.mouseClick(driver, page.step1LabelElement.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.roadMap2Step1Id, page.roadMap2Step1Id + "-Click_Label");
		verifyElementUI(page.selectedStepId, page.roadMap2Id + "-" + page.selectedStepId + "-s1-Click-Label");

		// Click on box of disabled Step #2
		String step2Id = page.roadMap2Step2Id;
		userAction.mouseClick(driver, page.step2BoxElement.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(step2Id, step2Id + "-Click-Box-Disabled");
		// Click on the page to remove the current focus
		userAction.mouseClickStartPoint(driver);

		// Click on label of disabled Step #2
		userAction.mouseClick(driver, page.step2LabelElement.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(waitMilliseconds);
		verifyElementUI(step2Id, step2Id + "-Click-Label-Disabled");

		// Check Step with SubSteps, Avoid twinkling on IE9 and IE10.
		checkMouseActionsOnSubSteps();

		// If the last step is not visible, navigate to the end of the roadMap
		WebElement endElement = page.endElement;
		userAction.mouseMove(driver, endElement.getAttribute("id"));
		while (endElement.getAttribute("class").contains(page.endScrollClassName)) {
			userAction.mouseClick(driver, endElement.getAttribute("id"));
		}
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-EndOfRoadMap");

	}

	@Test
	public void testKeyboardActions() {
		Actions actions = new Actions(driver);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_TAB);
		String roadMapId = page.roadMap2Id;

		// Navigate to the end of the roadMap
		userAction.pressOneKey(KeyEvent.VK_END);
		page.waitForNonExistClassName(driver, page.roadMapEndId, timeOutSeconds, page.endScrollClassName);
		verifyElementUI(roadMapId, roadMapId + "-KB-END");

		userAction.pressOneKey(KeyEvent.VK_SPACE);
		verifyRoadMapSelectedStep("-KB-END-SPACE");

		// Navigate to the start of the roadMap
		userAction.pressOneKey(KeyEvent.VK_HOME);
		page.waitForNonExistClassName(driver, page.roadMapStartId, timeOutSeconds, page.startScrollClassName);
		verifyElementUI(roadMapId, roadMapId + "-KB-HOME");

		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyRoadMapSelectedStep("-KB-END-ENTER");

		// Navigate to the next step using DOWN cursor key
		userAction.pressOneKey(KeyEvent.VK_DOWN);
		verifyElementUI(roadMapId, roadMapId + "-KB-DOWN");
		userAction.pressOneKey(KeyEvent.VK_SPACE);
		verifyElementUI(roadMapId, roadMapId + "-KB-DOWN-SPACE");

		// ------------- Check Step with SubSteps ----------------
		checkKeyboardOnSubSteps(actions);
	}

	private void checkMouseActionsOnSubSteps() {
		// Click on SubStep #2
		userAction.mouseClick(driver, page.step4Sub2Element.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyRoadMapSelectedStep("-Click");

		// Click on box of disabled SubStep #4
		String step4Sub4Id = page.step4Sub4Id;
		userAction.mouseClick(driver, page.step4Sub4BoxElement.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(step4Sub4Id, step4Sub4Id + "-Click-Box-Disabled");

		// Click on the page to remove the current focus
		userAction.mouseClickStartPoint(driver);

		// Click on label of disabled SubStep #4
		userAction.mouseClick(driver, page.step4Sub4LabelElement.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(step4Sub4Id, step4Sub4Id + "-Click-Label-Disabled");

		// Collapse SubSteps
		userAction.mouseClick(driver, page.step4ExpandendElement.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		waitForElement(driver, false, page.step4Sub1Id, timeOutSeconds);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-Collapsed-Substeps");

		// Expand SubSteps
		userAction.mouseClick(driver, page.step4Element.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		waitForElement(driver, true, page.step4Sub1Id, timeOutSeconds);
		waitForReady(waitMilliseconds);
		verifyRoadMapSelectedStep("-Expanded-Substeps");
	}

	private void checkKeyboardOnSubSteps(Actions actions) {
		// Navigate to the first SubStep using RIGHT /LEFT cursor key.
		page.moveToElementByKeyboard(actions, isRtlTrue(), 2);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-KB-SubStep");
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-KB-SubStep-ENTER");
		verifyElementUI(page.selectedStepId, page.roadMap2Id + "-" + page.selectedStepId + "-KB-SubStep-ENTER");

		// Navigate to the disabled SubStep using DOWN cursor key
		userAction.pressOneKey(KeyEvent.VK_DOWN);
		userAction.pressOneKey(KeyEvent.VK_DOWN);
		page.waitForElementClickable(driver, page.step4Sub4Id, timeOutSeconds);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-KB-Disbaled-SubStep");
		userAction.pressOneKey(KeyEvent.VK_SPACE);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-KB-Disbaled-SubStep-SPACE");

		// Collapse SubSteps
		userAction.pressOneKey(KeyEvent.VK_DOWN);
		page.waitForElementClickable(driver, page.roadMap2Step4ExpandendId, timeOutSeconds);
		waitForReady(waitMilliseconds);
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + "-KB-SubSteps-End");
		userAction.pressOneKey(KeyEvent.VK_SPACE);
		waitForElement(driver, false, page.step4Sub1Id, timeOutSeconds);
		waitForReady(waitMilliseconds);
		verifyRoadMapSelectedStep("-KB-Collapsed-SubSteps-SPACE");

		// Expand SubSteps
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForElement(driver, true, page.step4Sub1Id, timeOutSeconds);
		waitForReady(waitMilliseconds);
		verifyRoadMapSelectedStep("-KB-Expanded-SubSteps-ENTER");
	}

	private void verifyRoadMapSelectedStep(String imageSuffix) {
		verifyElementUI(page.roadMap2Id, page.roadMap2Id + imageSuffix);
		verifyElementUI(page.selectedStepId, page.roadMap2Id + "-" + page.selectedStepId + imageSuffix);
	}

}
