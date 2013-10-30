package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.TabStrip;
import com.sap.ui5.selenium.commons.TextField;

public class MatrixLayoutPO extends PageBase {

	@FindBy(id = "matrixLayout2")
	public WebElement matrix2;

	@FindBy(id = "matrixLayout3")
	public WebElement matrix3;

	@FindBy(id = "matrixLayout4")
	public WebElement matrix4;

	@FindBy(id = "tabStrip")
	public TabStrip tabStrip;

	@FindBy(id = "B-Change")
	public Button changeButton;

	@FindBy(id = "B-URL")
	public Button changeURLButton;

	@FindBy(id = "TF-URL")
	public TextField urlTextField;

	public String matrix1ID = "matrixLayout1";
}