package com.sap.ui5.modules.librarytests.ux3.pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.commons.Button;
import com.sap.ui5.selenium.commons.CheckBox;

public class NotificationBarPO extends PageBase {

	@FindBy(id = "myShell-notify")
	public WebElement notify;

	@FindBy(id = "btnAddNone")
	public Button noneBtn;

	@FindBy(id = "btnAddInfo")
	public Button infoBtn;

	@FindBy(id = "btnAddSuccess")
	public Button successBtn;

	@FindBy(id = "btnAddWarning")
	public Button warningBtn;

	@FindBy(id = "btnAddError")
	public Button errorBtn;

	@FindBy(id = "btnRemoveAll")
	public Button removeAllBtn;

	@FindBy(id = "cbClickListener")
	public CheckBox listener;

	@FindBy(id = "notificationBar")
	public WebElement notificationBar;

	@FindBy(id = "notifierIcon")
	public WebElement notificationIcon;

	@FindBy(id = "notificationBar-BarUp")
	public WebElement barUp;

	@FindBy(id = "notifierIcon-messageNotifierView-messageView-__message4-text")
	public WebElement errorMessageText;

	@FindBy(id = "notificationBar-ArrowUp")
	public WebElement arrowUp;

	@FindBy(id = "notificationBar-ArrowDown")
	public WebElement arrowDown;

	@FindBy(id = "notificationBar-BarDown")
	public WebElement barDown;

	public String togglerID = "notificationBar-toggler";

	public String callOutContID = "notifierIcon-callout";

	public String outPutSpanID = "eventOutput";

	public String hoverID = "notificationBar-toggler";

	public String successMessageId = "notificationBar-inplaceMessage-__message1";
}
