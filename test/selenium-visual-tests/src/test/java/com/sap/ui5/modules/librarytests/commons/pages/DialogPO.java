package com.sap.ui5.modules.librarytests.commons.pages;

import java.awt.Robot;
import java.awt.event.KeyEvent;

import org.openqa.selenium.By;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.CommonBase;
import com.sap.ui5.selenium.common.PageBase;

public class DialogPO extends PageBase {

	public String button1Id = "btn1";

	public String button2Id = "btn2";

	public String button3Id = "btn3";

	public String closeBtnIdSuffix = "-close";

	public String okBtnIdSuffix = "_Ok";

	public String cancelBtnIdSuffix = "_Cancel";

	public String myResultTvId = "myResultTv";

	public String myDialog1Id = "myDialog1";

	public String myDialog2Id = "myDialog2";

	public String myDialog3Id = "myDialog3";

	public String myDialog5Id = "myDialog5";

	public String dialogHeaderSuffix = "-hdr";

	public String dialogGripSuffix = "-grip";

	public long timeOutSeconds = 10;

	public void dragDrop(WebDriver driver, IUserAction userAction, String elementId, int xOffset, int yOffset) {
		dragDropByUserAction(driver, userAction, elementId, xOffset, yOffset);
		userAction.mouseMoveToStartPoint(driver);

	}

	public void dragDropByUserAction(WebDriver driver, IUserAction userAction, String elementId, int xOffset,
			int yOffset) {
		Point sourcePoint = userAction.getElementLocation(driver, elementId);
		WebElement element = driver.findElement(By.id(elementId));
		Point startPoint = new Point(sourcePoint.x + element.getSize().width / 2, sourcePoint.y
				+ element.getSize().height / 2);
		Point endPoint = new Point(startPoint.x + xOffset, startPoint.y + yOffset);
		userAction.dragAndDrop(driver, startPoint, endPoint);
	}

	public void openDialogByBtn(WebDriver driver, IUserAction userAction, String btnId, String dialogId, CommonBase base) {
		userAction.mouseClick(driver, btnId);
		userAction.mouseMoveToStartPoint(driver);
		base.waitForElement(driver, true, dialogId, timeOutSeconds);
	}

	public void closeDialogByBtn(WebDriver driver, IUserAction userAction, String btnId, String dialogId,
			CommonBase base) {
		userAction.mouseClick(driver, btnId);
		userAction.mouseMoveToStartPoint(driver);
		base.waitForElement(driver, false, dialogId, timeOutSeconds);
	}

	public void openDialogByEnter(WebDriver driver, IUserAction userAction, String dialogId, CommonBase base) {
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		base.waitForElement(driver, true, dialogId, timeOutSeconds);
	}

	public void closeDialogByKeyboard(WebDriver driver, IUserAction userAction, String dialogId, CommonBase base,
			Object... key) {
		sendKeysByRobot(userAction, key);
		base.waitForElement(driver, false, dialogId, timeOutSeconds);
	}

	public void sendKeysByRobot(IUserAction userAction, Object... keys) {
		for (Object key : keys) {
			if (key instanceof Integer) {
				Integer k = (Integer) key;
				userAction.pressOneKey(k);
			} else if (key instanceof String) {
				String[] keyArray = ((String) key).split("\\+");
				Robot robot = userAction.getRobot();
				for (String k : keyArray) {
					robot.keyPress(Integer.valueOf(k));
				}
				for (String k : keyArray) {
					robot.keyRelease(Integer.valueOf(k));
				}
			}

		}
	}
}