package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class ValueHelpFieldPO {

	@FindBy(xpath = "//div[starts-with(@data-sap-ui, 'vhf')]")
	public List<WebElement> vhFields;

	public String vhField1Id = "vhf1";

	public String vhField4Id = "vhf4";

	public String vhField7Id = "vhf7";

	public String outputTargetId = "outputTarget";

	public String iconSuffix = "-icon";

	public String inputSuffix = "-input";

	public int millisecond = 1000;
}
