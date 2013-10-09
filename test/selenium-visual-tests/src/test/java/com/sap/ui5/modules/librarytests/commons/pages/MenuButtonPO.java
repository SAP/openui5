package com.sap.ui5.modules.librarytests.commons.pages;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.PageBase;

public class MenuButtonPO extends PageBase {
	public String menuButton1Id = "menuButton1";

	public String menuButton2Id = "menuButton2";

	public String menu2Id = "menu2";

	public String menuButton3Id = "menuButton3";

	public String menuButton7Id = "menuButton7";

	public String menuButton8Id = "menuButton8";

	public String outputTargetId = "outputTarget";

	public int millisecond = 1000;

	public void pressOneKey(IUserAction userAction, int key, int count) {
		for (int i = 0; i < count; i++) {
			userAction.pressOneKey(key);
		}
	}
}
