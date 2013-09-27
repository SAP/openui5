package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class SliderPO extends PageBase {
	@FindBy(className = "sapUiSli")
	public List<WebElement> sliders;

	public String slider1Id = "sli1";

	public String slider6Id = "sli6";

	public String gripSuffix = "-grip";

	public String hiliSuffix = "-hili";

	public String targetPrefix = "target-";

	public String outputEventId = "sliVal";

	public int millisecond = 1000;
}
