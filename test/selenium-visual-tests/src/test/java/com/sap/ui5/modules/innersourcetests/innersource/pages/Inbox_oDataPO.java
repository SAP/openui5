package com.sap.ui5.modules.innersourcetests.innersource.pages;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.browserlaunchers.Sleeper;

import com.sap.ui5.selenium.common.PageBase;

public class Inbox_oDataPO extends PageBase {

	public String loadDataButtonId = "__button0";

	public String inboxId = "bpminbox";

	public String layoutId = "__layout0";

	public String timestampId = inboxId + "--refreshOnText";

	public String tableViewButtonId = inboxId + "--tableViewSelectionButton";

	public String streamViewButtonId = inboxId + "--rrViewSelectionButton";

	public String filterFacetId = inboxId + "--filterFacet";

	public String viewTableId = inboxId + "--listViewTable-table";

	public String popupId = inboxId + "--substitutionRulesManager--substitutionOverlayContainer";

	public String filterViewButtonId = inboxId + "--filterViewButton";

	public String item1Id = "__item1";

	public String item2Id = "__item2";

	public String settingsButtonId = inboxId + "--settingsButton";

	public String substitutingId = inboxId + "--substitutionRulesManager--iamSubstituting";

	public String closeSubstitingId = inboxId + "--substitutionRulesManager--substitutionOverlayContainer-close";

	public String searchFieldId = inboxId + "--searchField";

	public String clearSearchFieldId = inboxId + "--searchField-tf-searchico";

	public String tableRow13Id = inboxId + "--listViewTable-rowsel3";

	public int durationMillisecond = 1000;

	public void setElementVisible(WebDriver driver, String elementId, boolean isVisible) {
		((JavascriptExecutor) driver).executeScript("sap.ui.getCore().byId('" + elementId + "').setVisible("+ isVisible + ")");
		Sleeper.sleepTight(durationMillisecond * 2);
	}
}
