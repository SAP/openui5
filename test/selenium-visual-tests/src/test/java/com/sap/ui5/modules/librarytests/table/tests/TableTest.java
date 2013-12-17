package com.sap.ui5.modules.librarytests.table.tests;

import java.awt.event.KeyEvent;
import java.util.List;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.table.pages.TablePO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.core.UI5PageFactory;
import com.sap.ui5.selenium.util.Constants;
import com.sap.ui5.selenium.util.UI5Timeout;

public class TableTest extends TestBase {

	private TablePO page;

	private final int timeOutSeconds = 10;

	private final int millisecond = 500;

	private final String targetUrl = "/uilib-sample/test-resources/sap/ui/table/visual/Table.html";

	@Rule
	public UI5Timeout ui5Timeout = new UI5Timeout(18 * 60 * 1000);

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, TablePO.class);
		UI5PageFactory.initElements(driver, page);

		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	/** Verify full Page UI and all element initial UI */
	@Test
	public void testAllElements() {
		verifyPage("full-initial");
	}

	/** Verify Mouse Over event on table header */
	@Test
	public void testMouseOver() {
		userAction.mouseOver(driver, page.lastNameID, millisecond);
		verifyBrowserViewBox("MouseOver-tableHeader-" + page.lastNameID);

		userAction.mouseOver(driver, page.rating.getAttribute("id"), millisecond);
		verifyBrowserViewBox("MouseOver-tableHeader-" + page.rating.getAttribute("id"));
	}

	/** Verify page resizing and scroll bar */
	@Test
	public void testResizingScroll() {
		// Check table resizing with page resizing
		driver.manage().window().setPosition(new Point(50, 50));
		driver.manage().window().setSize(new Dimension(400, 600));
		Sleeper.sleepTightInSeconds(1);
		verifyBrowserViewBox("Page-Resizing");

		Dimension vPosD = page.vScrollBar.getSize();
		Dimension hPosD = page.hScrollBar.getSize();

		int v_y_pos = vPosD.height;
		int h_x_pos = hPosD.width;

		/** Scroll the table */
		// Scroll the table to the end
		page.scroll(userAction, driver, page.vScrollBar, 0, v_y_pos / 2);
		verifyBrowserViewBox("Scroll-to-End");

		// Scroll the table to the beginning
		page.scroll(userAction, driver, page.vScrollBar, 0, -(v_y_pos / 2));
		verifyBrowserViewBox("Scroll-to-Beginning");

		if (isRtlTrue()) {

			// Scroll the table to the left end
			page.scroll(userAction, driver, page.hScrollBar, -(h_x_pos / 2), 0);
			verifyBrowserViewBox("Scroll-to-Left");

			// Scroll the table to the right end
			page.scroll(userAction, driver, page.hScrollBar, h_x_pos / 2, 0);
			verifyBrowserViewBox("Scroll-to-Right");

		} else {

			// Scroll the table to the right end
			page.scroll(userAction, driver, page.hScrollBar, h_x_pos / 2, 0);
			verifyBrowserViewBox("Scroll-to-Right");

			// Scroll the table to the left end
			page.scroll(userAction, driver, page.hScrollBar, -(h_x_pos / 2), 0);
			verifyBrowserViewBox("Scroll-to-Left");
		}

	}

	/** Verify Pagination of Table */
	@Test
	public void testPagination() {
		Actions action = new Actions(driver);

		page.dialog.openWith(page.openTableDialogBtn);
		page.visibleRowCountInput.setValue("3");
		userAction.mouseClick(driver, page.navigtionModePaginatorID);
		closeDialog();
		verifyElement(page.tableID, "VisibleRowCount-3-NavigationMode-Paginator");

		// Check next page
		action.click(page.paginatorNextPage).perform();
		userAction.mouseOver(driver, page.paginatorNextPage.getAttribute("id"), millisecond);
		verifyElement(page.paginatorID, "Paginator-Next-Page");
		userAction.mouseMoveToStartPoint(driver);

		// Check last page
		action.click(page.paginatorLastPage).perform();
		verifyElement(page.paginatorID, "Paginator-Last-Page");

		// Check previous page
		action.click(page.paginatorPrePage).perform();
		userAction.mouseOver(driver, page.paginatorPrePage.getAttribute("id"), millisecond);
		verifyElement(page.paginatorID, "Paginator-Previous-Page");
		userAction.mouseMoveToStartPoint(driver);

		// Check first page
		action.click(page.paginatorFirstPage).perform();
		verifyElement(page.paginatorID, "Paginator-First-Page");

		// Check middle page
		action.click(page.paginatorMidPage).perform();
		userAction.mouseOver(driver, page.paginatorMidPage.getAttribute("id"), millisecond);
		verifyElement(page.paginatorID, "Paginator-Middle-Page");
	}

	/** Verify table features */
	@Test
	public void testTableFeatures() {
		Button openDialogBtn = page.openTableDialogBtn;

		// Check selectionMode API - Single Selection
		page.dialog.openWith(openDialogBtn);
		page.firstVisibleRowInput.setValue("0");
		page.visibleRowCountInput.setValue("6");
		page.singleSelMode.click();
		closeDialog();
		verifyElement(page.tableID, "SelectionMode-Single-" + page.tableID);

		// Select one entry by clicking on the row selector
		userAction.mouseClick(driver, page.tableRowSel3ID);
		Sleeper.sleepTightInSeconds(1);
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.tableID, "Select-SingleRow-" + page.tableID);

		// Select all by clicking selector icon
		page.dialog.openWith(openDialogBtn);
		page.multiSelMode.click();
		closeDialog();
		page.selectAll.click();
		List<WebElement> tableRows = page.tableRows;
		for (WebElement e : tableRows) {
			page.checkSelect(driver, e, true);
		}

		Sleeper.sleepTightInSeconds(1);
		verifyElement(page.tableContentID, "Select-All-" + page.tableID);

		// Deselect some entries only
		userAction.getRobot().keyPress(KeyEvent.VK_CONTROL);
		Sleeper.sleepTight(millisecond);
		userAction.mouseClick(driver, page.tableRowSel0ID);
		userAction.mouseClick(driver, page.tableRowSel5ID);
		userAction.getRobot().keyRelease(KeyEvent.VK_CONTROL);
		userAction.mouseMoveToStartPoint(driver);
		Sleeper.sleepTightInSeconds(1);
		verifyElement(page.tableContentID, "Deselect-some-entries-" + page.tableID);

		// Deselect all by clicking selector icon
		page.selectAll.click();
		for (WebElement e : tableRows) {
			page.checkSelect(driver, e, true);
		}

		page.selectAll.click();
		for (WebElement e : tableRows) {
			page.checkSelect(driver, e, false);
		}
		Sleeper.sleepTightInSeconds(1);
		verifyElement(page.tableContentID, "Deselect-All-" + page.tableID);

		// Check selectionMode API - No Selection
		page.dialog.openWith(openDialogBtn);
		page.noneSelMode.click();
		closeDialog();
		verifyElement(page.tableID, "SelectionMode-None-" + page.tableID);

		// Table list in groups
		page.dialog.openWith(openDialogBtn);
		page.visibleRowCountInput.clearValue();
		page.visibleRowCountInput.setValue("10");
		page.enableGroup.toggle();
		closeDialog();
		waitForReady(600);
		userAction.mouseClick(driver, page.linkID);
		userAction.mouseClick(driver, page.linkMenuGroupID);
		userAction.mouseClickStartPoint(driver);
		Sleeper.sleepTight(millisecond);
		verifyElement(page.tableID, "Grouping-Link-" + page.tableID);

		// Close Group
		userAction.mouseClick(driver, page.groupRow3ID);
		verifyElement(page.tableID, "Close-Groups-" + page.tableID);

		// Open Group
		userAction.mouseClick(driver, page.groupRow3ID);
		verifyElement(page.tableID, "Open-Groups-" + page.tableID);
	}

	/** Verify block actions of table */
	@Test
	public void testBlockActions() {
		Button openDialogBtn = page.openTableDialogBtn;

		// Check blocking menu opening (using preventDefault)
		page.dialog.openWith(openDialogBtn);
		page.firstVisibleRowInput.setValue("0");
		page.visibleRowCountInput.setValue("6");
		page.enableGroup.toggle();
		userAction.mouseClick(driver, page.blockActionsIcon.getAttribute("id"));
		page.blockActionMenu.click();
		closeDialog();
		userAction.mouseClick(driver, page.linkID);
		userAction.mouseMoveToStartPoint(driver);
		this.waitForElement(driver, false, page.linkMenuID, timeOutSeconds);
		verifyElement(page.tableID, "MenuBlocked-" + page.tableID);

		// Check blocking column movement (using preventDefault)
		page.dialog.openWith(openDialogBtn);
		page.blockActionsIcon.click();
		page.blockActionMove.click();
		closeDialog();
		userAction.dragAndDrop(driver, page.checkedID, page.firstName.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		Sleeper.sleepTight(millisecond);
		verifyElement(page.tableID, "ColumnMoveBlocked-" + page.tableID);

		// Check column visibility feature
		page.dialog.openWith(openDialogBtn);
		page.enableColumnVisibility.toggle();
		closeDialog();
		page.rating.click();
		userAction.mouseOver(driver, page.ratingMenuClumVisID, millisecond);
		page.ratingMenuColRating.click();
		userAction.mouseMoveToStartPoint(driver);
		Sleeper.sleepTight(millisecond);
		verifyElement(page.tableContentID, "ColumnInvisible-" + page.tableID);

		page.firstName.click();
		userAction.mouseOver(driver, page.firstNameVisibiltyID, millisecond);
		userAction.mouseClick(driver, page.firstNameColRatingID);
		userAction.mouseMoveToStartPoint(driver);
		Sleeper.sleepTight(millisecond);
		verifyElement(page.tableContentID, "ColumnVisible-" + page.tableID);
	}

	/** Verify sorting column feature */
	@Test
	public void testSort() {
		String firstNameID = page.firstName.getAttribute("id");
		String ratingID = page.rating.getAttribute("id");

		// Order table by last name in ascending
		userAction.mouseClick(driver, firstNameID);
		this.waitForElement(driver, true, page.firstNameMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.firstNameASCID);
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.firstNameSortIconID, timeOutSeconds);
		verifyElement(page.tableID, "Sort-firstName-Ascending-" + page.tableID);

		// Order table by last name in descending
		userAction.mouseClick(driver, firstNameID);
		this.waitForElement(driver, true, page.firstNameMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.firstNameDESCID);
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.firstNameSortIconID, timeOutSeconds);
		verifyElement(page.tableID, "Sort-firstName-Descending-" + page.tableID);

		// Order table by rating in ascending
		userAction.mouseClick(driver, ratingID);
		this.waitForElement(driver, true, page.ratingMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.ratingASCID);
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.ratingSortIconID, timeOutSeconds);
		verifyElement(page.tableID, "Sort-rating-Ascending-" + page.tableID);

		// Order table by rating in descending
		userAction.mouseClick(driver, ratingID);
		this.waitForElement(driver, true, page.ratingMenuID, timeOutSeconds);
		userAction.mouseClick(driver, page.ratingDESCID);
		userAction.mouseClickStartPoint(driver);
		this.waitForElement(driver, true, page.ratingSortIconID, timeOutSeconds);
		verifyElement(page.tableID, "Sort-rating-Descending-" + page.tableID);
	}

	/** Verify reordering of column*/
	@Test
	public void testReorder() {
		if (getBrowserType() == Constants.FIREFOX || getBrowserType() == Constants.FIREFOXESR) {
			userAction.pressOneKey(KeyEvent.VK_TAB);
		}

		page.dialog.openWith(page.openTableDialogBtn);
		page.firstVisibleRowInput.setValue("0");
		page.visibleRowCountInput.setValue("6");
		closeDialog();
		userAction.dragAndDrop(driver, page.firstName.getAttribute("id"), page.rating.getAttribute("id"));
		userAction.mouseMoveToStartPoint(driver);
		verifyElement(page.tableID, "Column-Reorder-" + page.tableID);
	}

	/** Verify table properties */
	@Test
	public void testTableProperties() {
		Button openDialogBtn = page.openTableDialogBtn;

		// Check firstVisibleRow API
		page.dialog.openWith(openDialogBtn);
		page.firstVisibleRowInput.setValue("0");
		closeDialog();
		verifyElement(page.tableID, "SetFirstVisibleRow-0-" + page.tableID);

		// Check visibleRowCount API
		page.dialog.openWith(openDialogBtn);
		page.visibleRowCountInput.setValue("6");
		closeDialog();
		verifyElement(page.tableID, "SetVisibleRowCount-6-" + page.tableID);

		// Check width API
		page.dialog.openWith(openDialogBtn);
		page.widthInput.setValue("700px");
		closeDialog();
		verifyElement(page.tableID, "SetWidth-700px-" + page.tableID);

		// Check row height API
		page.dialog.openWith(openDialogBtn);
		page.widthInput.clearValue();
		page.rowHeightInput.setValue("50");
		closeDialog();
		verifyElement(page.tableID, "SetRowHeight-50-" + page.tableID);

		// Check column header height API
		page.dialog.openWith(openDialogBtn);
		page.colHeaderHeightInput.setValue("50");
		closeDialog();
		verifyElement(page.tableID, "SetColHeaderHeight-50-" + page.tableID);

		// Check column header height API
		page.dialog.openWith(openDialogBtn);
		page.colHeaderVisible.toggle();
		closeDialog();
		Sleeper.sleepTightInSeconds(1);
		verifyElement(page.tableID, "SetColHeaderInvisible-" + page.tableID);

		// Check column header text wrapping API
		page.dialog.openWith(openDialogBtn);
		page.colHeaderVisible.toggle();
		page.colHeaderWrapping.toggle();
		closeDialog();
		verifyElement(page.tableID, "SetColHeaderWrapping-" + page.tableID);

		// Check table edit API
		page.dialog.openWith(openDialogBtn);
		page.colHeaderWrapping.toggle();
		page.editable.toggle();
		closeDialog();
		verifyElement(page.tableID, "SetTableReadonly-" + page.tableID);

		// Check table invisible API
		page.dialog.openWith(openDialogBtn);
		page.visible.toggle();
		closeDialog();
		verifyBrowserViewBox("SetTable-Invisible");
	}

	/** Close dialog */
	private void closeDialog() {
		page.dialog.close();
		userAction.mouseClickStartPoint(driver);
		Sleeper.sleepTight(millisecond);
	}
}