package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.WebDriver;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.InitService;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.util.Constants;

public class RatingIndicatorPO extends PageBase {

	public String itemSuffix = "-itm-";

	public String currentRatingId = "currentRating";

	public String normalId = "normal";

	public String normalROId = "normalRO";

	public String NormalRatingId = "NormalRating";

	public String NormalRORatingId = "NormalRORating";

	public String altId = "alt";

	public String AltRatingId = "AltRating";

	public String AltRORatingId = "AltRORating";

	public String normalItem1Id = "normal-itm-1";

	public String oContRating1Item1Id = "oContRating1-itm-1";

	public String normalItemPrefix = "normal-itm";

	public String altItemPrefix = "alt-itm";

	public int millisecond = 1000;

	public void showToolTip(WebDriver driver, IUserAction userAction, String elementId, int waitMillisecond) {
		switch (InitService.INSTANCE.getBrowserType()) {
		case Constants.IE10:
			userAction.mouseClick(driver, elementId);
		case Constants.FIREFOX:
			userAction.mouseOver(driver, elementId, waitMillisecond);
			userAction.mouseMoveToStartPoint(driver);
		}
		userAction.mouseOver(driver, elementId, waitMillisecond);
	}

	public void pressOneKey(IUserAction userAction, int key, int count) {
		for (int i = 0; i < count; i++) {
			userAction.pressOneKey(key);
		}
	}

	public void pressTwoKey(IUserAction userAction, int firstKey, int secondKey, int count) {
		for (int i = 0; i < count; i++) {
			userAction.pressTwoKeys(firstKey, secondKey);
		}
	}
}
