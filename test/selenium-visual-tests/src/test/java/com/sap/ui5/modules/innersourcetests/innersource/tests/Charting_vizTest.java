package com.sap.ui5.modules.innersourcetests.innersource.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.innersourcetests.innersource.pages.Charting_vizPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class Charting_vizTest extends TestBase {
	private Charting_vizPO page;

	private final String targetUrl = "/uilib-sample/test-resources/sap/viz/Charting.html";

	private final int durationMillisecond = 1000;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, Charting_vizPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
		waitForReady(durationMillisecond * 5);
	}

	@Test
	public void testDifferentCharts() {
		// Check pie chart
		clickAction(page.navigationPIEId);
		verifyFullPage("PieChart-normal");

		// Check line chart
		clickAction(page.navigationLINEId);
		verifyFullPage("LineChart-normal");

		userAction.mouseOver(driver, page.lineChartId, durationMillisecond);
		verifyFullPage("LineChart-MouseOver");

		// Check donut chart
		clickAction(page.navigationDONUTId);
		verifyFullPage("DonutChart-normal");

		// Check bar chart
		clickAction(page.navigationBARId);
		verifyFullPage("BarChart-normal");

		userAction.mouseOver(driver, page.barChartId, durationMillisecond);
		verifyFullPage("BarChart-MouseOver");

		// Check column chart
		clickAction(page.navigationCOLUMNId);
		verifyFullPage("ColumnChart-normal");

		userAction.mouseOver(driver, page.columnChartId, durationMillisecond);
		verifyFullPage("ColumnChart-MouseOver");

		// Check combination chart
		clickAction(page.navigationCOMBINATIONId);
		verifyFullPage("CombinationChart-normal");

		userAction.mouseOver(driver, page.combinationChartId, durationMillisecond);
		verifyFullPage("CombinationChart-MouseOver");

		// Check bubble chart
		clickAction(page.navigationBUBBLEId);
		verifyFullPage("BubbleChart-normal");

		// Check stacked V chart
		clickAction(page.navigationSTACKEDVId);
		verifyFullPage("StackedVChart-normal");

		userAction.mouseOver(driver, page.stackedVChartId, durationMillisecond);
		verifyFullPage("StackedVChart-MouseOver");

		// Check stacked V % chart
		clickAction(page.navigationSTACKEDVPctId);
		verifyFullPage("StackedVPctChart-normal");

		userAction.mouseOver(driver, page.stackedVPctChartId, durationMillisecond);
		verifyFullPage("StackedVPctChart-MouseOver");
	}

	public void clickAction(String elementId) {
		userAction.mouseClick(driver, elementId);
		if (getBrowserType() != Constants.CHROME) {
			userAction.mouseClickStartPoint(driver);
		}
		waitForReady(durationMillisecond * 5);
	}

	public void verifyFullPage(String expectedImageName) {
		if (getBrowserType() == Constants.CHROME) {
			verifyPage(expectedImageName);
		}
		else {
			verifyBrowserViewBox(expectedImageName);
		}
	}

}
