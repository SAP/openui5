package com.sap.ui5.modules.innersourcetests.innersource.tests;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
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
		loadPage(targetUrl);
		waitForReady(durationMillisecond * 10);
	}

	@Test
	public void testDifferentCharts() {
		// Check pie chart
		clickAction(page.navigationPIEId);
		verifyFullPage("PieChart-normal");

		// Check line chart
		clickAction(page.navigationLINEId);
		verifyFullPage("LineChart-normal");

		// Check donut chart
		clickAction(page.navigationDONUTId);
		verifyFullPage("DonutChart-normal");

		// Check bar chart
		clickAction(page.navigationBARId);
		verifyFullPage("BarChart-normal");

		mouseOverAction();
		verifyFullPage("BarChart-MouseOver");

		// Check column chart
		clickAction(page.navigationCOLUMNId);
		verifyFullPage("ColumnChart-normal");

		mouseOverAction();
		verifyFullPage("ColumnChart-MouseOver");

		// Check combination chart
		clickAction(page.navigationCOMBINATIONId);
		verifyFullPage("CombinationChart-normal");

		// Check bubble chart
		clickAction(page.navigationBUBBLEId);
		verifyFullPage("BubbleChart-normal");

		// Check stacked V chart
		clickAction(page.navigationSTACKEDVId);
		verifyFullPage("StackedVChart-normal");

		mouseOverAction();
		verifyFullPage("StackedVChart-MouseOver");

		// Check stacked V % chart
		clickAction(page.navigationSTACKEDVPctId);
		verifyFullPage("StackedVPctChart-normal");

		mouseOverAction();
		verifyFullPage("StackedVPctChart-MouseOver");
	}

	public void mouseOverAction() {
		Point location = driver.findElement(By.className(page.className)).getLocation();
		Point viewBoxLocation = userAction.getBrowserViewBoxLocation(driver);
		Dimension size = driver.findElement(By.className(page.className)).getSize();
		int xPoint = location.x + viewBoxLocation.x + size.width / 2 -30;
		int yPoint = location.y + viewBoxLocation.y + size.height / 2 - 20;
		Point newLocation = new Point(xPoint, yPoint);
		userAction.mouseMove(newLocation);
		waitForReady(durationMillisecond * 5);
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
