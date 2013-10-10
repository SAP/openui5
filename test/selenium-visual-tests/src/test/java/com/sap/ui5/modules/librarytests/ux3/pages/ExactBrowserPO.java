package com.sap.ui5.modules.librarytests.ux3.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;

import com.sap.ui5.selenium.common.PageBase;

public class ExactBrowserPO extends PageBase {

	public String countryItemId = "__item0";

	public String yearItemId = "__item1";

	public String salesOrderItemId = "__item2";

	public String germanyItemId = "__item5";

	public String firstCountryId = "__list0";

	public String firstListId = "__list1";

	public String secondListId = "__list2";

	public String thirdListId = "__list3";

	public String resetCheckboxId = "reset-CB";

	public String visibleCheckboxId = "visible";

	public String showTopCheckboxId = "topList";

	public String rootlistHeadId = "exactBrowser-rootlist-head";

	public String resultId = "result";

	public String rootlistContId = "exactBrowser-rootlist-cntnt";

	public String germanyListExpId = "__list1-exp";

	public String countryHeaderId = "__list0-head";

	public String countryListExpId = "__list0-exp";

	public String countryHideId = "__list0-hide";

	public String countryListCloseId = "__list0-close";

	public String germanyListHideId = "__list1-hide";

	public String germanyListRezId = "__list3-rsz";

	public String enableListCloseId = "listClose";

	public String germanyListCloseId = "__list1-close";

	public String germanyHederId = "__list1-head";

	public String showHeaderId = "header";

	public String resetBtnId = "exactBrowser-RstBtn";

	public String exactBrowserId = "exactBrowser";

	public String menuId = "__menu0";

	public void checkClass(WebElement element) {
		String eleClass = element.getAttribute("class");
		if (!eleClass.contains("sapUiUx3ExactLstCollapsed")) {
			Sleeper.sleepTight(500);
		}
	}

}