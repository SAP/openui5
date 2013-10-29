package com.sap.ui5.modules.librarytests.applications.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.applications.pages.Northwind_DemoPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class Northwind_DemoTest extends TestBase {

	private Northwind_DemoPO page;

	private String targetUrl = "/databinding/odata/products.html";

	private int durationMillisecond = 1000;

	// The location of logo is (0,0).Avoid to click the logo and tooltip being displayed, use (0, 700) to instead of start point.
	private Point point = new Point(0, 700);

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, Northwind_DemoPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClick(point);
		pageDataLoading();
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testClickAction() {
		userAction.mouseClick(driver, page.row1SelectorId);
		userAction.mouseMove(point);
		waitForReady(durationMillisecond);
		verifyFullPageUI("Select_Row1");
	}

	@Test
	public void testDragAndDropAction() {
		int height = driver.findElement(By.id(page.oTableScrollbarId)).getSize().height;

		Point scrollBar = userAction.getElementLocation(driver, page.oTableScrollbarId);
		Point sourceLocation = new Point(scrollBar.x + 8, scrollBar.y + 25);
		Point targetLocation = new Point(scrollBar.x + 8, scrollBar.y + height);

		userAction.dragAndDrop(driver, sourceLocation, targetLocation);
		userAction.mouseMove(point);
		waitForReady(durationMillisecond);
		verifyFullPageUI("DragScrollbar");
	}

	@Test
	public void testCloseAndOpenDifferentPanels() {
		userAction.mouseClick(driver, page.row10SelectorId);
		userAction.mouseMove(point);

		// Close Product Details Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			userAction.mouseClick(driver, page.productPanelIconId);
		}
		else {
			userAction.mouseClick(driver, page.productPanelArrowId);
		}
		waitForReady(durationMillisecond);

		// Close Supplier Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			userAction.mouseClick(driver, page.supplierPanelIconId);
		}
		else {
			userAction.mouseClick(driver, page.supplierPanelArrowId);
		}
		waitForReady(durationMillisecond);

		// Close Category Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			userAction.mouseClick(driver, page.categoryPanelIconId);
		}
		else {
			userAction.mouseClick(driver, page.categoryPanelArrowId);
		}
		userAction.mouseClick(point);
		waitForReady(durationMillisecond);
		verifyFullPageUI("Closed_AllPanels");

		// Open and close the selected details in a different view
		userAction.mouseClick(driver, page.openButtonId);
		userAction.mouseMove(point);
		verifyFullPageUI("Open_SelectedDetails");

		userAction.mouseClick(driver, page.backButtonId);
		userAction.mouseMove(point);
		verifyFullPageUI("Close_SelectedDetails");

		// Open Product Details Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			userAction.mouseClick(driver, page.productPanelIconId);
		}
		else {
			userAction.mouseClick(driver, page.productPanelArrowId);
		}
		waitForReady(durationMillisecond);

		// Open Supplier Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			userAction.mouseClick(driver, page.supplierPanelIconId);
		}
		else {
			userAction.mouseClick(driver, page.supplierPanelArrowId);
		}
		waitForReady(durationMillisecond);

		// Open Category Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			userAction.mouseClick(driver, page.categoryPanelIconId);
		}
		else {
			userAction.mouseClick(driver, page.categoryPanelArrowId);
		}
		userAction.mouseClick(point);
		waitForReady(durationMillisecond);
		verifyFullPageUI("Opened_AllPanels");
	}

	@Test
	public void testSortingOfData() {
		// Check sorting of Product ID descending
		openMenu("ProductID", true);
		userAction.mouseClick(driver, page.productSortDescId);
		userAction.mouseMove(point);
		pageDataLoading();
		verifyFullPageUI("Sort_Descending");

		// Check sorting of Product ID ascending
		openMenu("ProductID", true);
		userAction.mouseClick(driver, page.productSortAscId);
		userAction.mouseMove(point);
		pageDataLoading();
		verifyFullPageUI("Sort_Ascending");
	}

	@Test
	public void testFilteringData() {
		// Check filtering by Product Name
		openMenu("ProductName", true);
		userAction.mouseClick(driver, page.productNameFilterId);
		userAction.mouseMove(point);
		new Actions(driver).sendKeys("ch").perform();
		waitForReady(durationMillisecond);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(durationMillisecond * 10);
		verifyFullPageUI("Filter_ProductName");

		// Check filtering by Quantity per unit
		openMenu("QuantityPerUnit", true);
		userAction.mouseClick(driver, page.quantityFilterId);
		userAction.mouseMove(point);
		new Actions(driver).sendKeys(Keys.chord(Keys.CONTROL, "a"), "box").perform();
		waitForReady(durationMillisecond);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(durationMillisecond * 10);
		verifyFullPageUI("Filter_QuantityPerUnit");

		// Check filtering by Discontinued
		openMenu("Discontinued", true);
		userAction.mouseClick(driver, page.discontinuedFilterId);
		userAction.mouseMove(point);
		new Actions(driver).sendKeys(Keys.chord(Keys.CONTROL, "a"), "false").perform();
		waitForReady(durationMillisecond);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(durationMillisecond * 10);
		verifyFullPageUI("Filter_Discontinued");

		// Check filtering by Category Id
		openMenu("QuantityPerUnit", true);
		userAction.mouseClick(driver, page.quantityFilterId);
		userAction.mouseMove(point);
		new Actions(driver).sendKeys(Keys.chord(Keys.CONTROL, "a"), Keys.DELETE).perform();
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(durationMillisecond * 10);

		openMenu("CategoryID", true);
		userAction.mouseClick(driver, page.categoryFilterId);
		userAction.mouseMove(point);
		new Actions(driver).sendKeys("3").perform();
		waitForReady(durationMillisecond);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForReady(durationMillisecond * 10);
		verifyFullPageUI("Filter_CategoryId");
	}

	public void openMenu(String menuName, boolean isVisible) {
		By by = By.xpath("//label[text() = '" + menuName + "'][contains(@id, '__label')]");
		userAction.mouseClick(driver, driver.findElement(by).getAttribute("id"));
		waitForReady(durationMillisecond * 5);
		waitForElement(driver, isVisible, By.xpath("//div[contains(@id, '-menu')]"), durationMillisecond);
	}

	public void pageDataLoading() {
		for (int i = 0; i < 20; i++) {
			if (driver.findElement(By.id(page.row1ProductId)).getText().equals("")) {
				waitForReady(durationMillisecond * 5);
			}
			else {
				break;
			}
		}
		waitForReady(durationMillisecond * 5);
	}
}
