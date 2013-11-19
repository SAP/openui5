package com.sap.ui5.modules.scenariotests.applications.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.scenariotests.applications.pages.EPM_DemoPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.table.SortOrder;
import com.sap.ui5.selenium.util.Constants;

public class EPM_DemoTest extends TestBase {

	private EPM_DemoPO page;

	private int millisecond = 800;

	private final String targetUrl = "/databinding/epm/products.html";

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, EPM_DemoPO.class);
		UI5PageFactory.initElements(driver, page);

		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		waitForReady(millisecond);
		verifyPage("full-initial");
	}

	/** Verify if data is loaded correctly from backend */
	@Test
	public void testLoadData() {
		this.waitForElement(driver, true, page.tableCell00.getAttribute("id"), 10);

		// Navigate to Page 5
		page.pageFive.click();
		page.checkCellText(page.tableCell09, "HT-1096");
		userAction.mouseMove(driver, page.page7ID);
		verifyElement(page.table.getId(), "NavigatePage5");

		// Move Mousepointer over row #3 and check, whether it gets highlighted
		userAction.mouseOver(driver, page.tableCell02ID, 1000);
		verifyElement(page.table.getId(), "MouseOver-Row3");

		// Select first entry in the DataTable
		page.row0Selector.click();
		waitForReady(2000);
		page.checkFieldValue(page.companyField, "Indian IT Trading Company");
		verifyElement(page.panelRowID, "Row1-Selected");

		// Close Product Details Panel and Supplier Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			page.productCollIco.click();
			page.supplierCollIco.click();
			userAction.mouseMove(driver, page.supplierCollIco.getAttribute("id"));
		} else {
			page.productCollArrow.click();
			page.supplierCollArrow.click();
		}
		verifyElement(page.panelRowID, "Panel-Closed");

		// Open Product Details Panel and Supplier Panel
		if (getThemeType() == Constants.THEME_GOLDREFLECTION || getThemeType() == Constants.THEME_PLATINUM) {
			page.productCollIco.click();
			page.supplierCollIco.click();
			userAction.mouseMove(driver, page.supplierCollIco.getAttribute("id"));

		} else {
			page.productCollArrow.click();
			page.supplierCollArrow.click();
		}
		verifyElement(page.panelRowID, "Panel-Opened");
	}

	/** Verify open the selected details in a different view and back to the preview page */
	@Test
	public void testViewDetails() {
		this.waitForElement(driver, true, page.tableCell00.getAttribute("id"), 10);
		page.row0Selector.click();
		waitForReady(2000);
		page.checkFieldValue(page.companyField, "Robert Brown Entertainment");

		page.openButton.click();
		waitForReady(millisecond);
		page.checkFieldValue(page.supplierField, "Robert Brown Entertainment");
		verifyBrowserViewBox("SelectedDetails-Opened");

		page.backButton.click();
		userAction.mouseMoveToStartPoint(driver);
		verifyBrowserViewBox("SelectedDetails-Closed");
	}

	/** Check sorting of data */
	@Test
	public void testSort() {
		this.waitForElement(driver, true, page.tableCell00.getAttribute("id"), 10);
		page.table.sort(0, SortOrder.Descending);
		waitForReady(1000);
		userAction.mouseMoveToStartPoint(driver);

		page.checkCellText(page.tableCell00, "HT-9999");
		page.checkFieldValue(page.companyField, "");
		verifyElement(page.table.getId(), "Sort-Descending");
	}
}
