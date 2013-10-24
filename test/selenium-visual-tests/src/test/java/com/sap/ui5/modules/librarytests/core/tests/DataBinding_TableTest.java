package com.sap.ui5.modules.librarytests.core.tests;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.core.pages.DataBinding_TablePO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.UI5Timeout;

public class DataBinding_TableTest extends TestBase {

	private DataBinding_TablePO page;

	private final int timeOutSeconds = 10;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/core/visual/DataBinding_Table.html";

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(20 * 60 * 1000); // 20 minutes

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, DataBinding_TablePO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	/** Verify sorting of the DataBinding table */
	@Test
	public void testSort() {
		// Sort ascending by Company
		userAction.mouseClick(driver, page.companyCol.getAttribute("id"));
		this.waitForElement(driver, true, page.companyMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.companyMenuAsc.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.companySortIconID, timeOutSeconds);
		verifyBrowserViewBox("Sort-Ascending-Company");

		// Sort descending by Company
		userAction.mouseClick(driver, page.companyCol.getAttribute("id"));
		this.waitForElement(driver, true, page.companyMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.companyMenuDesc.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.companySortIconID, timeOutSeconds);
		verifyBrowserViewBox("Sort-Descending-Company");

		// Sort ascending by Revenue
		page.revenueCol.click();
		this.waitForElement(driver, true, page.revenueMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.revenueMenuAsc.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.revenueSortIconID, timeOutSeconds);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.revenueCol.getAttribute("id"));
		}
		verifyBrowserViewBox("Sort-Ascending-Revenue");

		// Sort descending by Revenue
		page.revenueCol.click();
		this.waitForElement(driver, true, page.revenueMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.revenueMenuDesc.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.revenueSortIconID, timeOutSeconds);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.revenueCol.getAttribute("id"));
		}
		verifyBrowserViewBox("Sort-Descending-Revenue");

		// Sort ascending by Employees
		page.employeesCol.click();
		this.waitForElement(driver, true, page.employeeMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.employeesMenuAsc.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.employeeSortIconID, timeOutSeconds);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.employeesCol.getAttribute("id"));
		}
		verifyBrowserViewBox("Sort-Ascending-Employees");

		// Sort descending by Employees
		page.employeesCol.click();
		this.waitForElement(driver, true, page.employeeMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.employeesMenuDesc.getAttribute("id"));
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.employeeSortIconID, timeOutSeconds);

		if (isAboveIE8()) {
			userAction.mouseMove(driver, page.employeesCol.getAttribute("id"));
		}
		verifyBrowserViewBox("Sort-Descending-Employees");
	}

	/** Verify the filter feature of the DataBinding table */
	@Test
	public void testFilter() {
		/** Filter on Company column */
		// Filter on Company - EQUALS
		clickSendKeys("=SAP AG");
		verifyBrowserViewBox("Filter-Company-Equals-SAPAG");

		clickSendKeys("=google");
		verifyBrowserViewBox("Filter-Company-Equals-case-Google");

		// Filter on Company - STARTS WITH
		clickSendKeys("O*");
		verifyBrowserViewBox("Filter-Company-StartsWith-O");

		// Filter on Company - ENDS WITH
		clickSendKeys("*G");
		verifyBrowserViewBox("Filter-Company-EndsWith-G");

		// Filter on Company - CONTAINS
		clickSendKeys("roso");
		verifyBrowserViewBox("Filter-Company-Contains-roso");

		// Filter on Company - NOT EQUALS
		clickSendKeys("!=Oracle");
		verifyBrowserViewBox("Filter-Company-NotEquals-Oracle");

		// Filter on Company - LESS THAN
		clickSendKeys("<Microsoft");
		verifyBrowserViewBox("Filter-Company-LessThan-Microsoft");

		// Filter on Company - LESS OR EQUAL

		clickSendKeys("<=Microsoft");
		verifyBrowserViewBox("Filter-Company-LessOrEqual-Microsoft");

		// Filter on Company - GREATER THAN
		clickSendKeys(">Oracle");
		verifyBrowserViewBox("Filter-Company-GreaterThan-Oracle");

		// Filter on Company - GREATER OR EQUAL
		clickSendKeys(">=Oracle");
		verifyBrowserViewBox("Filter-Company-GreaterOrEqual-Oracle");

		// Filter on Several columns: company>Apple, revenue<62.48
		clickSendKeys(">Apple");
		userAction.mouseClick(driver, page.revenueCol.getAttribute("id"));
		this.waitForElement(driver, true, page.revenueMenuID, timeOutSeconds);
		page.revenueMenuFilterInput.sendKeys("<62.48");
		page.revenueMenuFilterInput.sendKeys(Keys.RETURN);
		this.waitForElement(driver, true, page.revenueFilterIconID, timeOutSeconds);
		verifyBrowserViewBox("Filter-Company-Revenue");
	}

	/** Click company column and send keys to the filter input. */
	private void clickSendKeys(String str) {
		userAction.mouseClick(driver, page.companyCol.getAttribute("id"));
		this.waitForElement(driver, true, page.companyMenuID, timeOutSeconds);
		page.companyMenuFilterInput.sendKeys(Keys.chord(Keys.CONTROL, "a"));
		page.companyMenuFilterInput.sendKeys(str);
		page.companyMenuFilterInput.sendKeys(Keys.RETURN);
		this.waitForElement(driver, true, page.companyFilterIconID, timeOutSeconds);
	}

	private boolean isAboveIE8() {
		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			return true;
		}
		return false;
	}
}