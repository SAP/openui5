package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class PasswordFieldPO {

	@FindBy(xpath = "//input[@type = 'password']")
	public List<WebElement> passwordFields;

	public String outputEventId = "pwdEvent";
}
