package com.sap.ui5.modules.librarytests.ux3.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.CheckBox;
import com.sap.ui5.selenium.ux3.ThingInspector;

public class ThingInspectorPO extends PageBase {

	@FindBy(id = "standardTI")
	public Button standardTIBtn;

	@FindBy(id = "modifiedTI")
	public Button modifiedTIBtn;

	@FindBy(id = "thingInspector")
	public ThingInspector thingInspector;

	@FindBy(id = "thingInspector-actionBar-closeButton")
	public Button closeBtn;

	@FindBy(id = "updateAction")
	public CheckBox updateCheckBox;

	@FindBy(id = "followAction")
	public CheckBox followCheckBox;

	@FindBy(id = "favoriteAction")
	public CheckBox favoriteCheckBox;

	@FindBy(id = "flagAction")
	public CheckBox flagCheckBox;

	@FindBy(id = "thingInspector-actionBar-Update")
	public WebElement actionBarUpdate;

	@FindBy(id = "thingInspector-actionBar-Feeder-input")
	public WebElement actionBarUpdateInput;

	public String accountTeamID = "accountTeam";

	public String actionBarID = "thingInspector-actionBar";

	public String facetContentID = "thingInspector-thingViewer-facetContent";
}
