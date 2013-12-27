package com.sap.ui5.modules.librarytests.table.pages;

import java.util.List;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.CheckBox;
import com.sap.ui5.selenium.commons.Dialog;
import com.sap.ui5.selenium.commons.TextField;

public class TablePO extends PageBase {

	@FindBy(id = "propsDlg")
	public Dialog dialog;

	@FindBy(id = "tblProps")
	public Button openTableDialogBtn;

	@FindBy(id = "tableId-selall")
	public WebElement selectAll;

	@FindBy(id = "tableId-vsb")
	public WebElement vScrollBar;

	@FindBy(id = "tableId-hsb")
	public WebElement hScrollBar;

	@FindBy(id = "firstName")
	public WebElement firstName;

	@FindBy(id = "rating")
	public WebElement rating;

	@FindBy(id = "rating-menu-column-visibilty-menu-item-6")
	public WebElement ratingMenuColRating;

	@FindBy(id = "tableId-rows-row6")
	public WebElement groupRow;

	// Table Paginator
	@FindBy(id = "tableId-paginator--firstPageLink")
	public WebElement paginatorFirstPage;

	@FindBy(id = "tableId-paginator--backLink")
	public WebElement paginatorPrePage;

	@FindBy(id = "tableId-paginator--forwardLink")
	public WebElement paginatorNextPage;

	@FindBy(id = "tableId-paginator--lastPageLink")
	public WebElement paginatorLastPage;

	@FindBy(id = "tableId-paginator-li--3")
	public WebElement paginatorMidPage;

	// Items in dialog
	@FindBy(id = "fstVisRow")
	public TextField firstVisibleRowInput;

	@FindBy(id = "visRowCnt")
	public TextField visibleRowCountInput;

	@FindBy(id = "width")
	public TextField widthInput;

	@FindBy(id = "rowHeight")
	public TextField rowHeightInput;

	@FindBy(id = "colHeaderHeight")
	public TextField colHeaderHeightInput;

	@FindBy(id = "rbgSelMode-0")
	public WebElement noneSelMode;

	@FindBy(id = "rbgSelMode-1")
	public WebElement singleSelMode;

	@FindBy(id = "rbgSelMode-2")
	public WebElement multiSelMode;

	@FindBy(id = "chkColGrp")
	public CheckBox enableGroup;

	@FindBy(id = "chkColVis")
	public CheckBox enableColumnVisibility;

	@FindBy(id = "chkColHdrVis")
	public CheckBox colHeaderVisible;

	@FindBy(id = "chkColHdrWrap")
	public CheckBox colHeaderWrapping;

	@FindBy(id = "chkAllowEdit")
	public CheckBox editable;

	@FindBy(id = "chkVisibility")
	public CheckBox visible;

	@FindBy(id = "blockActions-icon")
	public WebElement blockActionsIcon;

	@FindBy(id = "noMenu")
	public WebElement blockActionMenu;

	@FindBy(id = "noMove")
	public WebElement blockActionMove;

	@FindBy(className = "sapUiTableRowHdr")
	public List<WebElement> tableRows;

	public String tableID = "tableId";

	public String tableContentID = "tableId-table";

	public String paginatorID = "tableId-paginator";

	public String lastNameID = "lastName";

	public String linkID = "link";

	public String checkedID = "checked";

	public String linkMenuID = "link-menu";

	public String linkMenuGroupID = "link-menu-group";

	public String firstNameMenuID = "firstName-menu";

	public String ratingMenuID = "rating-menu";

	public String firstNameASCID = "firstName-menu-asc";

	public String firstNameDESCID = "firstName-menu-desc";

	public String firstNameSortIconID = "firstName-sortIcon";

	public String firstNameVisibiltyID = "firstName-menu-column-visibilty";

	public String ratingASCID = "rating-menu-asc";

	public String ratingDESCID = "rating-menu-desc";

	public String ratingSortIconID = "rating-sortIcon";

	public String tableRowSel0ID = "tableId-rowsel0";

	public String tableRowSel3ID = "tableId-rowsel3";

	public String tableRowSel5ID = "tableId-rowsel5";

	public String groupRow3ID = "tableId-rowsel6";

	public String navigtionModePaginatorID = "rbgNavMode-1";

	public String ratingMenuClumVisID = "rating-menu-column-visibilty";

	public String firstNameColRatingID = "firstName-menu-column-visibilty-menu-item-6";

	/** Drag scroll bar of table. */
	public void scroll(IUserAction userAction, WebDriver driver, WebElement element, int xOffset, int yOffset) {
		userAction.mouseClick(driver, element.getAttribute("id"));
		userAction.dragAndDrop(driver, element.getAttribute("id"), xOffset, yOffset);
		userAction.mouseClickStartPoint(driver);
		Sleeper.sleepTightInSeconds(1);
	}

	/** Check element select property. */
	public void checkSelect(WebDriver driver, WebElement element, boolean flag) {
		String selectFlag = element.getAttribute("aria-selected");
		selectFlag.equals(flag);
	}
}
