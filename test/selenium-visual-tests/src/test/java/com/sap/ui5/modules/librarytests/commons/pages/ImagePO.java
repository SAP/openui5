package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class ImagePO extends PageBase {

	@FindBy(id = "i8")
	public WebElement image8;

	public String imageI2Id = "i2";

	public String outputTargetId = "outputTarget";

	public String target8AreaId = "target_i8";
}
