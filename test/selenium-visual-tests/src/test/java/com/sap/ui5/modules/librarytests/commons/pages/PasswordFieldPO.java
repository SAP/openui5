package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class PasswordFieldPO extends PageBase {

	@FindBy(xpath = "//input[@type = 'password']")
	public List<WebElement> passwordFields;

	public String outputEventId = "pwdEvent";
}
