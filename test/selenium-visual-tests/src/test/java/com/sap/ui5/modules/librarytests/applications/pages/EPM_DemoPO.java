package com.sap.ui5.modules.librarytests.applications.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.TextField;
import com.sap.ui5.selenium.table.Table;

public class EPM_DemoPO extends PageBase {

	@FindBy(id = "oTable")
	public Table table;

	@FindBy(id = "__view0-col0-row0")
	public WebElement tableCell00;

	@FindBy(id = "oTable-paginator-li--5")
	public WebElement pageFive;

	@FindBy(id = "__view0-col0-row9")
	public WebElement tableCell09;

	@FindBy(id = "oTable-rowsel0")
	public WebElement row0Selector;

	@FindBy(id = "__field3")
	public TextField companyField;

	@FindBy(id = "ProductFormSupplier")
	public TextField supplierField;

	@FindBy(id = "__panel0-collIco")
	public WebElement productCollIco;

	@FindBy(id = "__panel0-collArrow")
	public WebElement productCollArrow;

	@FindBy(id = "__panel1-collIco")
	public WebElement supplierCollIco;

	@FindBy(id = "__panel1-collArrow")
	public WebElement supplierCollArrow;

	@FindBy(id = "__button0")
	public Button openButton;

	@FindBy(id = "__button2")
	public Button backButton;

	public String tableCell02ID = "__view0-col0-row2";

	public String page7ID = "oTable-paginator-a--7";

	public void checkCellText(WebElement element, String text) {
		String innerText = element.getText();

		if (!innerText.equals(text)) {
			Sleeper.sleepTight(1000);
		}
	}

	public void checkFieldValue(TextField field, String text) {
		String fieldValue = field.getValue();

		if (!fieldValue.equals(text)) {
			Sleeper.sleepTight(1000);
		}
	}
}