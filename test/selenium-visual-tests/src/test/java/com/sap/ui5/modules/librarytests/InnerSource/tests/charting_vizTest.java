package com.sap.ui5.modules.librarytests.InnerSource.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.InnerSource.pages.charting_vizPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class charting_vizTest extends TestBase {
	private charting_vizPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/viz/Charting.html";

	private int durationMillisecond = 1000;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, charting_vizPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
		waitForReady(durationMillisecond * 5);
	}

	@Test
	public void testDifferentCharts() {
		// Check line chart
		verifyBrowserViewBox("LineChart-normal");

		userAction.mouseOver(driver, page.lineChartId, durationMillisecond);
		verifyBrowserViewBox("LineChart-MouseOver");

		// Check pie chart
		clickAction(page.navigationPIEId);
		verifyBrowserViewBox("PieChart-normal");

		// Check donut chart
		clickAction(page.navigationDONUTId);
		verifyBrowserViewBox("DonutChart-normal");

		// Check bar chart
		clickAction(page.navigationBARId);
		verifyBrowserViewBox("BarChart-normal");

		userAction.mouseOver(driver, page.barChartId, durationMillisecond);
		verifyBrowserViewBox("BarChart-MouseOver");

		// Check column chart
		clickAction(page.navigationCOLUMNId);
		verifyBrowserViewBox("ColumnChart-normal");

		userAction.mouseOver(driver, page.columnChartId, durationMillisecond);
		verifyBrowserViewBox("ColumnChart-MouseOver");

		// Check combination chart
		clickAction(page.navigationCOMBINATIONId);
		verifyBrowserViewBox("CombinationChart-normal");

		userAction.mouseOver(driver, page.combinationChartId, durationMillisecond);
		verifyBrowserViewBox("CombinationChart-MouseOver");

		// Check bubble chart
		clickAction(page.navigationBUBBLEId);
		verifyBrowserViewBox("BubbleChart-normal");

		// Check stacked V chart
		clickAction(page.navigationSTACKEDVId);
		verifyBrowserViewBox("StackedVChart-normal");

		userAction.mouseOver(driver, page.stackedVChartId, durationMillisecond);
		verifyBrowserViewBox("StackedVChart-MouseOver");

		// Check stacked V  % chart
		clickAction(page.navigationSTACKEDVPctId);
		verifyBrowserViewBox("StackedVPctChart-normal");

		userAction.mouseOver(driver, page.stackedVPctChartId, durationMillisecond);
		verifyBrowserViewBox("StackedVPctChart-MouseOver");
	}

	public void clickAction(String elementId) {
		userAction.mouseClick(driver, elementId);
		if (getBrowserType() != Constants.CHROME) {
			userAction.mouseClickStartPoint(driver);
		}
		waitForReady(durationMillisecond * 5);
	}

}
