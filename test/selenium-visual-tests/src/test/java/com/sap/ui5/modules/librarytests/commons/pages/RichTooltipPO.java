package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class RichTooltipPO extends PageBase {

	@FindBy(css = "*[id$=Rtt]")
	public List<WebElement> elementsWithTooltip;

	public String panelRttId = "panelRtt";

	public String richTooltipSuffix = "-rtt";

	public String panelRttTitleId = "panelRtt-title";
}
