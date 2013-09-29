package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class ProgressIndicatorPO extends PageBase {
	@FindBy(className = "sapUiTf")
	public WebElement oTextFieldId;

	public String target1Id = "target1";

	public String target2Id = "target2";

	public String progInd1Id = "progInd1";

	public String progInd2Id = "progInd2";

	public String progInd4Id = "progInd4";

	public String progInd30Id = "progInd30";

	public int millisecond = 1000;
}
