package com.sap.ui5.modules.librarytests.commons.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.SplitterPO;
import com.sap.ui5.selenium.common.TestBase;

public class SplitterTest extends TestBase {

	private SplitterPO page;

	private String targetUrl = "/test-resources/sap/ui/commons/visual/Splitter.html";

	private int waitTimeMillsecond = 1000;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, SplitterPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseActions() {
		Actions actions = new Actions(driver);
		// Check Mouse actions on splitter1
		String splitterId = page.splitter1.getAttribute("id");

		// Check whether the SplitterBar can be hidden/showed
		userAction.mouseClick(driver, page.splitter1HideBtn.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(splitterId, splitterId + "-HideSplitterBar");
		userAction.mouseClick(driver, page.splitter1ShowBtn.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(splitterId, splitterId + "-ShowSplitterBar");

		// Remove focus from the button
		userAction.mouseClickStartPoint(driver);

		checkHorizontalByMouse(actions);

		// Check vertical splitterBar of splitter5
		checkVerticalByMouse(actions);
	}

	@Test
	public void testSplitterTooltip() {
		// Check Mouse Tooltip on splitterBar
		String splitterId = page.splitter1.getAttribute("id");

		// take screenshot of Splitter control, when mouse is hovered over the SplitterBar
		showToolTip(page.splitter1Bar.getAttribute("id"), waitTimeMillsecond);
		verifyBrowserViewBox(splitterId + "-Tooltip");
	}

	@Test
	public void testKeyboardActions() {
		Actions actions = new Actions(driver);

		// Check keyboard on splitter1
		checkHorizontalByKeyboard(actions);

		// Check keyboard on splitter5
		checkVerticalByKeyboard(actions);
	}

	private void checkHorizontalByMouse(Actions actions) {
		WebElement splitter1Bar = page.splitter1Bar;
		String splitter1BarId = page.splitter1Bar.getAttribute("id");
		int barX = splitter1Bar.getSize().width / 2;
		WebElement firstPane = page.splitter1FirstPane;
		WebElement secondPane = page.splitter1SecondPane;
		String splitterId = page.splitter1.getAttribute("id");

		// Shrink Pane1 to half height, using Drag and Drop
		dragAndDrop(driver, splitter1BarId, barX, -firstPane.getSize().height / 2);
		verifyElementUI(splitterId, splitterId + "-Mouse-ShrinkPane1");

		// Shrink Pane2 to half height, using Drag and Drop
		dragAndDrop(driver, splitter1BarId, barX, secondPane.getSize().height / 2);
		verifyElementUI(splitterId, splitterId + "-Mouse-ShrinkPane2");

		int barHeight = splitter1Bar.getSize().height;

		// Collapse Pane1 to not being visible anymore, using Drag and Drop
		dragAndDrop(driver, splitter1BarId, barX, -firstPane.getSize().height - barHeight);
		verifyElementUI(splitterId, splitterId + "-Mouse-CollapsePane1");

		// Collapse Pane2 to not being visible anymore, using Drag and Drop
		dragAndDrop(driver, splitter1BarId, barX, secondPane.getSize().height + barHeight);
		verifyElementUI(splitterId, splitterId + "-Mouse-CollapsePane2");

		// Drop the Splitter outside the allowed UI area of Pane1
		dragAndDrop(driver, splitter1BarId, barX, -firstPane.getSize().height - 10);
		verifyElementUI(splitterId, splitterId + "-DropOutsidePane1");

		// Drop the Splitter outside the allowed UI area of Pane2
		dragAndDrop(driver, splitter1BarId, barX, secondPane.getSize().height + 10);
		verifyElementUI(splitterId, splitterId + "-DropOutsidePane2");
	}

	private void checkVerticalByMouse(Actions actions) {
		WebElement splitter5Bar = page.splitter5Bar;
		String splitter5BarId = page.splitter5Bar.getAttribute("id");
		int barY = splitter5Bar.getSize().height;
		String splitterId = page.splitter5.getAttribute("id");
		WebElement firstPane = page.splitter5FirstPane;
		WebElement secondPane = page.splitter5SecondPane;
		int isRtl = isRtlTrue() ? -1 : 1;

		// Shrink Pane1 to half width, using Drag and Drop
		dragAndDrop(driver, splitter5BarId, (-firstPane.getSize().width / 2) * isRtl, barY);
		verifyElementUI(splitterId, splitterId + "-Mouse-ShrinkPane1");

		// Shrink Pane2 to half width, using Drag and Drop
		dragAndDrop(driver, splitter5BarId, (secondPane.getSize().width / 2) * isRtl, barY);
		verifyElementUI(splitterId, splitterId + "-Mouse-ShrinkPane2");

		int barWidth = splitter5Bar.getSize().width;
		// Collapse Pane1 to not being visible anymore, using Drag and Drop
		dragAndDrop(driver, splitter5BarId, (-firstPane.getSize().width - barWidth) * isRtl, barY);
		verifyElementUI(splitterId, splitterId + "-Mouse-CollapsePane1");

		// Collapse Pane2 to not being visible anymore, using Drag and Drop
		dragAndDrop(driver, splitter5BarId, (secondPane.getSize().width + barWidth) * isRtl, barY);
		verifyElementUI(splitterId, splitterId + "-Mouse-CollapsePane2");

		// Drop the Splitter outside the allowed UI area of Pane1
		dragAndDrop(driver, splitter5BarId, (-firstPane.getSize().width - 10) * isRtl, barY);
		verifyElementUI(splitterId, splitterId + "-DropOutsidePane1");

		// Drop the Splitter outside the allowed UI area of Pane2
		dragAndDrop(driver, splitter5BarId, (secondPane.getSize().width + 10) * isRtl, barY);
		verifyElementUI(splitterId, splitterId + "-DropOutsidePane2");
	}

	private void checkHorizontalByKeyboard(Actions actions) {
		String splitterId = page.splitter1.getAttribute("id");
		String targetAreaId = page.target1Id;
		String shiftUp = Keys.chord(Keys.SHIFT, Keys.UP);
		String shiftDown = Keys.chord(Keys.SHIFT, Keys.DOWN);

		// Check keyboard navigation on Content Pane 1
		// The function is changed.
		userAction.mouseClick(driver, page.splitter1Bar.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		actions.sendKeys(shiftUp, shiftUp).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-SHIFT-UP");
		actions.sendKeys(shiftDown, shiftDown, shiftDown, shiftDown).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-SHIFT-DOWN");
		actions.sendKeys(Keys.HOME).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-HOME");
		actions.sendKeys(Keys.END).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-END");
	}

	private void checkVerticalByKeyboard(Actions actions) {
		String splitterId = page.splitter5.getAttribute("id");
		String targetAreaId = page.target5Id;
		String shiftLeft = Keys.chord(Keys.SHIFT, Keys.LEFT);
		String shiftRight = Keys.chord(Keys.SHIFT, Keys.RIGHT);

		// Check keyboard navigation on Content Pane 2
		// The function is changed.
		userAction.mouseClick(driver, page.splitter5Bar.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		actions.sendKeys(shiftLeft, shiftLeft, shiftLeft, shiftLeft).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-SHIFT-LEFT");
		actions.sendKeys(shiftRight, shiftRight).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-SHIFT-RIGHT");
		actions.sendKeys(Keys.END).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-END");
		actions.sendKeys(Keys.HOME).perform();
		verifyElementUI(targetAreaId, splitterId + "-KB-HOME");
	}

	public void dragAndDrop(WebDriver driver, String sourceElementId, int offsetX, int offsetY) {
		userAction.dragAndDrop(driver, sourceElementId, offsetX, offsetY);
		userAction.mouseMoveToStartPoint(driver);
	}
}
