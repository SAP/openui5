package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

public class RichTooltipPO {

	@FindBy(css = "*[id$=Rtt]")
	public List<WebElement> elementsWithTooltip;

	public String panelRttId = "panelRtt";

	public String richTooltipSuffix = "-rtt";

	public String panelRttTitleId = "panelRtt-title";
}
