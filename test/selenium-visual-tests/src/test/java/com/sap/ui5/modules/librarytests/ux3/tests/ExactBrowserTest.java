package com.sap.ui5.modules.librarytests.ux3.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.ux3.pages.ExactBrowserPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class ExactBrowserTest extends TestBase {

	private ExactBrowserPO page;

	private final int millisecond = 1000;

	private final int timeOutSeconds = 10;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/ux3/visual/ExactBrowser.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, ExactBrowserPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		waitForReady(millisecond);
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testSelectAttribute() {
		userAction.mouseClick(driver, page.rootlistHeadId);
		this.waitForElement(driver, true, page.menuId, timeOutSeconds);
		verifyElementUI(page.exactBrowserId, "HeadMenuOpen");

		userAction.mouseClick(driver, page.rootlistContId);
		this.waitForElement(driver, false, page.menuId, timeOutSeconds);
		verifyElementUI(page.exactBrowserId, "HeadMenuClose");

		/** Select attributes*/
		// Select several attributes in the list
		userAction.mouseClick(driver, page.countryItemId);
		this.waitForElement(driver, true, page.firstCountryId, timeOutSeconds);
		userAction.mouseClick(driver, page.yearItemId);
		this.waitForElement(driver, true, page.firstListId, timeOutSeconds);

		userAction.mouseClick(driver, page.salesOrderItemId);
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, true, page.secondListId, timeOutSeconds);
		verifyElementUI(page.exactBrowserId, "Selected-severalAttributes");
		verifyElementUI(page.resultId, "Selected-severalAttributes-" + page.resultId);

		// Deselect attribute
		userAction.mouseClick(driver, page.yearItemId);
		userAction.mouseClick(driver, page.salesOrderItemId);
		userAction.mouseMoveToStartPoint(driver);
		waitForReady(millisecond);
		verifyElementUI(page.exactBrowserId, "Deselected-Year");
		verifyElementUI(page.resultId, "Deselected-Year-Sales-" + page.resultId);

		// Open sublist of already selected attribute
		userAction.mouseClick(driver, page.germanyItemId);
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, true, page.thirdListId, timeOutSeconds);
		verifyElementUI(page.exactBrowserId, "Country-Selected-Germany");
		verifyElementUI(page.resultId, "Country-Selected-Germany-" + page.resultId);

	}

	@Test
	public void testListAttribute() {
		userAction.mouseClick(driver, page.countryItemId);
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, true, page.firstCountryId, timeOutSeconds);
		userAction.mouseClick(driver, page.germanyItemId);
		this.waitForElement(driver, true, page.firstListId, timeOutSeconds);

		//Expand complete list
		userAction.mouseOver(driver, page.countryListExpId, millisecond);
		verifyElementUI(page.exactBrowserId, "MouseOver-CountryExpanded");
		userAction.mouseClick(driver, page.countryListExpId);
		userAction.mouseMoveToStartPoint(driver);

		// Increase stability on IE9 and IE10.
		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			userAction.mouseMove(driver, page.countryListExpId);
		}
		waitForReady(millisecond);
		verifyBrowserViewBox("List-Country-Expanded");

		// Expand long list
		userAction.mouseOver(driver, page.germanyListExpId, millisecond);
		verifyElementUI(page.exactBrowserId, "MouseOver-GermanyExpanded");

		userAction.mouseClick(driver, page.germanyListExpId);
		userAction.mouseMoveToStartPoint(driver);

		// Increase stability on IE9 and IE10.
		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			userAction.mouseMove(driver, page.germanyListExpId);
		}
		waitForReady(millisecond);
		verifyBrowserViewBox("List-Germany-Expanded");
		userAction.mouseClick(driver, page.germanyListExpId);

		String germanyListHideId = page.germanyListHideId;

		// Collapse long list
		userAction.mouseOver(driver, germanyListHideId, millisecond);
		userAction.mouseClick(driver, germanyListHideId);
		userAction.mouseMoveToStartPoint(driver);
		page.checkClass(driver.findElement(By.id(page.firstListId)));
		verifyElementUI(page.exactBrowserId, "List-Country-Germany-Hidden");

		userAction.mouseClick(driver, germanyListHideId);

		// Close list
		userAction.mouseClick(driver, page.enableListCloseId);
		userAction.mouseMoveToStartPoint(driver);

		userAction.mouseOver(driver, page.germanyHederId, millisecond);
		userAction.mouseClick(driver, page.germanyListCloseId);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.exactBrowserId, "List-GermanyList-Closed");

		userAction.mouseOver(driver, page.countryHeaderId, millisecond);
		userAction.mouseClick(driver, page.countryListCloseId);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.exactBrowserId, "List-Country-Closed");

		userAction.mouseClick(driver, page.countryItemId);
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, true, page.secondListId, timeOutSeconds);
		userAction.mouseClick(driver, page.germanyItemId);
		userAction.mouseMoveToStartPoint(driver);

		//List resizing
		userAction.mouseOver(driver, page.germanyListRezId, millisecond);

		Point rezWP = userAction.getElementLocation(driver, page.germanyListRezId);
		Dimension dimension = driver.findElement(By.id(page.germanyListRezId)).getSize();
		int rezWI = dimension.width;

		if (isRtlTrue()) {
			userAction.dragAndDrop(driver, new Point(rezWP.x + rezWI / 3, rezWP.y + 20), new Point(rezWP.x + 100, rezWP.y + 20));
		} else {
			userAction.dragAndDrop(driver, new Point(rezWP.x + rezWI / 2, rezWP.y + 20), new Point(rezWP.x - 100, rezWP.y + 20));
		}
		userAction.mouseMoveToStartPoint(driver);
		verifyElementUI(page.exactBrowserId, "List-Germany-Resizing");
	}

	@Test
	public void testShowHideAttribute() {

		// Check Reset Feature
		userAction.mouseClick(driver, page.resetCheckboxId);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.exactBrowserId, "Disable-Reset");

		userAction.mouseClick(driver, page.resetCheckboxId);
		userAction.mouseClick(driver, page.resetBtnId);
		userAction.mouseClickStartPoint(driver);
		verifyElementUI(page.exactBrowserId, "Enable-Reset");
		verifyElementUI(page.resultId, "Enable-Reset-" + page.resultId);

		// Check Header Feature
		userAction.mouseClick(driver, page.showHeaderId);
		verifyElementUI(page.exactBrowserId, "Hide-Header");

		userAction.mouseClick(driver, page.showHeaderId);
		verifyElementUI(page.exactBrowserId, "Show-Header");

		// Check ExactBrowser visibility
		userAction.mouseClick(driver, page.visibleCheckboxId);
		userAction.mouseClickStartPoint(driver);
		verifyBrowserViewBox("Invisibility");
		userAction.mouseClick(driver, page.visibleCheckboxId);

		// Check ExactBrowser Top List visibility - Hide
		userAction.mouseClick(driver, page.showTopCheckboxId);
		verifyElementUI(page.exactBrowserId, "Hide-TopList");

		userAction.mouseClick(driver, page.showTopCheckboxId);
		verifyElementUI(page.exactBrowserId, "Show-TopList");
	}

	@Test
	public void testKeyboardActions() {

		Actions action = new Actions(driver);

		// select reset checkbox
		action.sendKeys(Keys.TAB, Keys.TAB, Keys.TAB, Keys.SPACE).perform();
		verifyElementUI(page.exactBrowserId, "KB-Select-ResetCheckbox");
		action.sendKeys(Keys.SPACE).perform();

		// option menu action
		action.sendKeys(Keys.TAB, Keys.TAB, Keys.SPACE).perform();
		action.sendKeys(Keys.TAB, Keys.TAB).perform();
		waitForReady(millisecond);

		if (getBrowserType() == Constants.IE8) {
			driver.findElement(By.id(page.rootlistHeadId)).sendKeys(Keys.ENTER);
		} else {
			userAction.pressOneKey(KeyEvent.VK_ENTER);
		}
		this.waitForElement(driver, true, page.menuId, timeOutSeconds);
		verifyFullPageUI("KB-optionsMenu-Opened");
		action.sendKeys(Keys.TAB).perform();
		this.waitForElement(driver, false, page.menuId, timeOutSeconds);
		verifyFullPageUI("KB-optionsMenu-Closed");

		// Select attributes
		action.sendKeys(Keys.TAB, Keys.RETURN, Keys.DOWN, Keys.DOWN, Keys.SPACE, Keys.END, Keys.RETURN).perform();
		this.waitForElement(driver, true, page.firstListId, timeOutSeconds);
		this.waitForElement(driver, true, page.secondListId, timeOutSeconds);
		verifyElementUI(page.exactBrowserId, "KB-SelectAttributes");
		verifyElementUI(page.resultId, "KB-SelectAttributes-" + page.resultId);

		// Show sublist
		action.sendKeys(Keys.TAB).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		this.waitForElement(driver, true, page.thirdListId, timeOutSeconds);
		verifyElementUI(page.exactBrowserId, "KB-ShowSubList");
		verifyElementUI(page.resultId, "KB-ShowSubList-" + page.resultId);

		// Focus last country
		action.sendKeys(Keys.END).perform();
		verifyElementUI(page.exactBrowserId, "KB-Focus-LastCountry");

		// Deselect Attributes
		if (userAction.getRtl()) {
			action.sendKeys(Keys.LEFT).perform();
		} else {
			action.sendKeys(Keys.RIGHT).perform();
		}
		action.sendKeys(Keys.DELETE).perform();
		action.sendKeys(Keys.TAB).perform();
		action.sendKeys(Keys.DELETE).perform();
		waitForReady(millisecond);
		verifyElementUI(page.exactBrowserId, "KB-DeselectAttributes");
		verifyElementUI(page.resultId, "KB-DeselectAttributes-" + page.resultId);

		// Reset browser
		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_TAB);
		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_TAB);
		action.sendKeys(Keys.SPACE).perform();
		waitForReady(millisecond);
		verifyElementUI(page.exactBrowserId, "KB-Reset");
		verifyElementUI(page.resultId, "KB-Reset-" + page.resultId);
	}

}