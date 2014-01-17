package com.sap.ui5.modules.librarytests.ux3.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.FacetFilterInTablePO;
import com.sap.ui5.selenium.common.TestBase;

public class FacetFilterInTableTest extends TestBase {

	private FacetFilterInTablePO page;

	private final int millisecond = 1000;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/FacetFilterInTable.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, FacetFilterInTablePO.class);
		loadPage(targetUrl);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		waitForReady(millisecond);
		verifyPage("full-initial");
	}

	/** Verify filter feature in table. */
	@Test
	public void testFilter() {

		// Check filtering of Car Brand only
		page.item0f10.click();
		waitForReady(millisecond);
		verifyElement(page.targetID, "Fiter-BrandOnly-BMW");

		// Check filtering of Car Model only
		page.brandAll.click();
		page.item0f21.click();
		page.checkAttribute(page.item0f21);
		waitForReady(millisecond);
		verifyElement(page.targetID, "Fiter-ModelOnly-325i");

		// Check filtering of Car Type only
		page.modelAll.click();
		page.item0f32.click();
		page.checkAttribute(page.item0f32);
		verifyElement(page.targetID, "Filter-TypeOnly-Cabrio");

		// Check multi selection in FacetFilter
		page.typeAll.click();
		page.item0f30.click();
		userAction.getRobot().keyPress(KeyEvent.VK_CONTROL);
		userAction.mouseClick(driver, page.item0f33.getAttribute("id"));
		userAction.getRobot().keyRelease(KeyEvent.VK_CONTROL);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.targetID, "Filter-TypeMulti-SportsTourer");

		// Check filtering of Car Brand and Car Model
		userAction.mouseClickStartPoint(driver);
		page.typeAll.click();
		page.item0f11.click();
		page.checkAttribute(page.item0f11);
		verifyElement(page.targetID, "Filter-BrandModel-OPEL-Astra");

		//Check filtering of Car Model and Car Type
		page.brandAll.click();
		page.item0f33.click();
		page.item0f20.click();
		page.checkAttribute(page.item0f20);
		waitForReady(millisecond);
		verifyElement(page.targetID, "Filter-ModelType-320d-SportsTourer");

		// Check filtering of Car Brand and Car Type
		page.typeAll.click();
		page.modelAll.click();
		page.item0f11.click();
		page.item0f30.click();
		page.checkAttribute(page.item0f30);
		verifyElement(page.targetID, "Filter-BrandType-OPEL-Limousine");

		// Check reset
		page.brandAll.click();
		page.typeAll.click();
		page.checkAttribute(page.typeAll);
		verifyElement(page.targetID, "Filter-Reset");
	}

	/** Verify keyboard actions in table. */
	@Test
	public void testKeyboardActions() {
		Actions action = new Actions(driver);

		// Check filtering of Car Brand only
		waitForReady(millisecond);
		action.sendKeys(Keys.TAB, Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		verifyElement(page.targetID, "KB-Filter-BrandOnly");

		// Check filtering of Car Model only
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.TAB, Keys.DOWN, Keys.DOWN, Keys.SPACE).perform();
		verifyElement(page.targetID, "KB-Filter-ModelOnly");

		//Check filtering of Car Type only
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.TAB, Keys.DOWN, Keys.DOWN, Keys.DOWN, Keys.SPACE).perform();
		waitForReady(millisecond);
		verifyElement(page.targetID, "KB-Filter-TypeOnly");

		// Check multi selection in Facet Filter
		action.sendKeys(Keys.DOWN, Keys.SPACE, Keys.HOME, Keys.DOWN).perform();
		userAction.getRobot().keyPress(KeyEvent.VK_CONTROL);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		userAction.getRobot().keyRelease(KeyEvent.VK_CONTROL);
		waitForReady(millisecond);
		verifyElement(page.targetID, "KB-Filter-MultiSelect");

		// Check filtering Car Brand and Car Model
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.typeAll);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.DOWN, Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.item0f11);
		action.sendKeys(Keys.TAB, Keys.DOWN).perform();
		action.sendKeys(Keys.DOWN, Keys.DOWN, Keys.SPACE).perform();
		page.checkAttribute(page.item0f22);
		verifyElement(page.targetID, "KB-Filter-BrandModel");

		// Check filtering Car Model and Car Type
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.item0f10);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.TAB, Keys.TAB, Keys.END, Keys.SPACE).perform();
		page.checkAttribute(page.modelAll);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		page.checkAttribute(page.item0f20);
		waitForReady(millisecond);
		action.sendKeys(Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.item0f30);
		waitForReady(millisecond);
		verifyElement(page.targetID, "KB-Filter-ModelType");

		// Check filtering Car Brand and Car Type
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.TAB, Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.END, Keys.SPACE).perform();
		page.checkAttribute(page.item0f12);
		waitForReady(millisecond);
		action.sendKeys(Keys.TAB, Keys.TAB, Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(millisecond);
		page.checkAttribute(page.item0f31);
		waitForReady(millisecond);
		verifyElement(page.targetID, "KB-Filter-BrandType");

		// Check filtering Car Brand, Car Model and Car Type
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.DOWN, Keys.DOWN, Keys.SPACE).perform();
		page.checkAttribute(page.item0f11);
		action.sendKeys(Keys.TAB, Keys.DOWN, Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.item0f21);
		waitForReady(millisecond);
		action.sendKeys(Keys.TAB, Keys.DOWN).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.item0f11);
		waitForReady(millisecond);
		verifyElement(page.targetID, "KB-Filter-BrandModelType");

		// Check reset
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		action.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		page.checkAttribute(page.item0f11);
		waitForReady(millisecond);
		action.sendKeys(Keys.HOME).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		page.checkAttribute(page.brandAll);
		waitForReady(millisecond);
		verifyElement(page.targetID, "KB-Filter-Reset");
	}
}
