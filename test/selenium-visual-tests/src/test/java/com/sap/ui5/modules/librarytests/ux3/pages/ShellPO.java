package com.sap.ui5.modules.librarytests.ux3.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.CheckBox;
import com.sap.ui5.selenium.commons.Link;
import com.sap.ui5.selenium.commons.ListBox;
import com.sap.ui5.selenium.commons.TextField;
import com.sap.ui5.selenium.ux3.Shell;

public class ShellPO extends PageBase {

	@FindBy(id = "myShell")
	public Shell myShell;

	@FindBy(id = "myShell-tool-myShell-searchTool")
	public WebElement searchTool;

	@FindBy(id = "myShell-tool-myShell-feederTool")
	public WebElement feederTool;

	@FindBy(id = "myShell-tool-optionsPopup")
	public WebElement optionsPopupTool;

	@FindBy(id = "headerTypeLstBox")
	public ListBox headerTypeList;

	// Mavigation items
	@FindBy(id = "jump_news")
	public Link jumpNews;

	@FindBy(id = "myShell-wsBar-ofb")
	public WebElement navLeft;

	@FindBy(id = "myShell-wsBar-off")
	public WebElement navRight;

	@FindBy(id = "wi_item")
	public TextField contentInput;

	@FindBy(id = "wi_home_overview")
	public WebElement overview;

	@FindBy(id = "btn_add_wi")
	public Button addWorksetItemBtn;

	@FindBy(id = "btn_add_facet")
	public Button addFacetBtn;

	@FindBy(id = "btn_add_pbi")
	public Button addPaneBarBtn;

	@FindBy(id = "btn_change_title")
	public Button changeTitleBtn;

	@FindBy(id = "btn_remove_wi")
	public Button removeWorksetItemBtn;

	@FindBy(id = "btn_remove_facet")
	public Button removeFacetBtn;

	@FindBy(id = "btn_remove_pbi")
	public Button removePaneBarBtn;

	@FindBy(id = "cb_tools")
	public CheckBox showTool;

	@FindBy(id = "cb_search")
	public CheckBox showSearch;

	@FindBy(id = "cb_feeder")
	public CheckBox showFeeder;

	@FindBy(id = "cb_pane")
	public CheckBox showPane;

	@FindBy(id = "cb_logout")
	public CheckBox showLogout;

	@FindBy(id = "myShell-paneBarOverflowText")
	public WebElement panebarOverflow;

	public String workSetBarID = "myShell-wsBar";

	public String facetBarID = "myShell-facetBar";

	public String paneBarID = "myShell-paneBarRight";

	public String cavasID = "myShell-canvas";

	public String headerID = "myShell-hdr";

	public String marketingID = "wi_m";

	public String salesOrderID = "wi_so";

	public String workSetContentID = "wi_cont";

	public String marketInfoID = "wi_m_mi";

	public String overviewID = "wi_home_overview";

	public String standardID = "standardHeader";

	public String brandOnlyID = "brandOnly";

	public String noNavigationID = "noNavigation";

	public String slimNavID = "slimNavigation";

	public String leftSideToolsID = "myShell-tp";

	public String shellHeaderID = "myShell-hdr";

	public String searchDivID = "myShell-searchTool";

	public String feederDivID = "myShell-feederTool";

	public String optionPopDivID = "optionsPopup";

	public String optionHeaderIconID = "headerTypeSwitch-icon";

	public String messageBoxID = "__mbox0";

	public String logoutID = "myShell-logout";

	public String facetBarListID = "myShell-facetBar-list";
}