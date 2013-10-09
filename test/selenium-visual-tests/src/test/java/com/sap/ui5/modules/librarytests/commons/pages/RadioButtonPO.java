package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;

public class RadioButtonPO extends PageBase {

	@FindBy(className = "sapUiRb")
	public List<WebElement> radioButtons;

	public String radioBtn2Id = "radioBtn2";

	@FindBy(id = "radioBtn2")
	public WebElement radioBtn2;

	public String radioBtn4Id = "radioBtn4";

	public String radioBtn7Id = "radioBtn7";

	public String radioBtn10Id = "radioBtn10";

	@FindBy(id = "radioBtn10")
	public WebElement radioBtn10;

	public String selStateId = "selState";

	@FindBy(id = "Btn1")
	public WebElement button;

	public String radioIdSuffix = "-RB";

	public int millisecond = 1000;

	public int position(String searchItem) {
		int position = 0;
		for (WebElement e : radioButtons) {
			String elementId = e.getAttribute("id");
			position = position + 1;
			if (searchItem.equals(elementId)) {
				break;
			}
		}
		return position;
	}
}
