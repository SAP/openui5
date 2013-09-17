package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class TextAreaPO {
	@FindBy(id = "txtArea5")
	public WebElement textArea5;

	@FindBy(id = "txtArea7")
	public WebElement textArea7;

	@FindBy(id = "txtArea8")
	public WebElement textArea8;

	@FindBy(id = "txtArea10")
	public WebElement textArea10;

	@FindBy(id = "txtArea14")
	public WebElement textArea14;

	public int millisecond = 1000;
}
