package com.sap.ui5.modules.librarytests.ux3.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.CheckBox;
import com.sap.ui5.selenium.commons.RadioButtonGroup;
import com.sap.ui5.selenium.ux3.Shell;
import com.sap.ui5.selenium.ux3.ThingInspector;

public class ThingInspectorInShellPO extends PageBase {

	@FindBy(id = "myShell")
	public Shell myShell;

	@FindBy(id = "thingInspector")
	public ThingInspector thingInspector;

	@FindBy(id = "standardTI")
	public Button standardTIBtn;

	@FindBy(id = "modifiedTI1")
	public Button modifiedTIWithOpen;

	@FindBy(id = "modifiedTI2")
	public Button modifiedTIWithClose;

	@FindBy(id = "openNew--btn-OK")
	public Button openNewOKBtn;

	@FindBy(id = "thingInspector-actionBar-closeButton")
	public Button closeBtn;

	@FindBy(id = "thingInspector-openNew")
	public WebElement openNew;

	@FindBy(id = "thingInspector-close")
	public WebElement standardClose;

	@FindBy(id = "updateAction")
	public CheckBox updateCheckbox;

	@FindBy(id = "followAction")
	public CheckBox followCheckbox;

	@FindBy(id = "favoriteAction")
	public CheckBox favoriteCheckbox;

	@FindBy(id = "flagAction")
	public CheckBox flagCheckbox;

	@FindBy(id = "cb_tools")
	public CheckBox showToolCheckbox;

	@FindBy(id = "cb_pane")
	public CheckBox showPaneCheckbox;

	@FindBy(id = "rgb_headerType")
	public RadioButtonGroup headerTypeGroup;

	@FindBy(id = "thingInspector-actionBar-Feeder-input")
	public WebElement updateInput;

	@FindBy(id = "myShell-tool-myShell-searchTool")
	public WebElement searchTool;

	@FindBy(id = "thingInspector-actionBar-Update")
	public WebElement actionBarUpdate;

	public String standardRadioID = "rgb_headerType-0";

	public String brandOnlyRadioID = "rgb_headerType-1";

	public String noNavRadioID = "rgb_headerType-2";

	public String slimNavRadioID = "rgb_headerType-3";

	public String feedID = "feed";

	public String accountTeamID = "accountTeam";

	public String thingViewerID = "thingInspector-thingViewer";

	public String updatePopupID = "thingInspector-actionBar-UpdateActionPopup";

	public String openNewID = "openNew";

	public String searchDivID = "myShell-searchTool-content";

	public String dialogID = "__mbox0";

	public String feederID = "thingInspector-actionBar-Feeder";

	public String actionBarFollowID = "thingInspector-actionBar-Follow";

	public String actionBarFlagID = "thingInspector-actionBar-Flag";

	public String actionBarFavoriteID = "thingInspector-actionBar-Favorite";
}
