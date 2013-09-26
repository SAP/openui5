package com.sap.ui5.modules.librarytests.core.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class DataBinding_TablePO extends PageBase {

	@FindBy(id = "company")
	public WebElement companyCol;

	@FindBy(id = "company-menu-asc")
	public WebElement companyMenuAsc;

	@FindBy(id = "company-menu-desc")
	public WebElement companyMenuDesc;

	@FindBy(id = "company-menu-filter-tf")
	public WebElement companyMenuFilterInput;

	@FindBy(id = "revenue")
	public WebElement revenueCol;

	@FindBy(id = "revenue-menu-asc")
	public WebElement revenueMenuAsc;

	@FindBy(id = "revenue-menu-desc")
	public WebElement revenueMenuDesc;

	@FindBy(id = "revenue-menu-filter-tf")
	public WebElement revenueMenuFilterInput;

	@FindBy(id = "employees")
	public WebElement employeesCol;

	@FindBy(id = "employees-menu-asc")
	public WebElement employeesMenuAsc;

	@FindBy(id = "employees-menu-desc")
	public WebElement employeesMenuDesc;

	public String companyMenuID = "company-menu";

	public String revenueMenuID = "revenue-menu";

	public String employeeMenuID = "employees-menu";

	public String companySortIconID = "company-sortIcon";

	public String revenueSortIconID = "revenue-sortIcon";

	public String employeeSortIconID = "employees-sortIcon";

	public String companyFilterIconID = "company-filterIcon";

	public String revenueFilterIconID = "revenue-filterIcon";
}
