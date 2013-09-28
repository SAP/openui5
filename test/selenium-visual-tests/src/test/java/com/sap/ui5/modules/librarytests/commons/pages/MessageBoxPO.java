package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;
import java.util.concurrent.TimeUnit;

import org.openqa.selenium.By;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.browserlaunchers.Sleeper;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.common.InitService;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.util.Constants;

public class MessageBoxPO extends PageBase {

	@FindBy(id = "msgBoxAlert1")
	public WebElement alert1Btn;

	@FindBy(id = "msgBoxShow1")
	public WebElement boxShow1Btn;

	@FindBy(css = "div[class='sapUiDlgBtns'] button")
	public List<WebElement> dialogBtns;

	@FindBy(css = "a[class='sapUiDlgCloseBtn']")
	public WebElement closeBtn;

	@FindBy(css = "div[role='alertdialog']")
	public WebElement alertDialog;

	@FindBy(className = "sapUiDlgHdrLeft")
	public WebElement dragBar;

	public String callbackTriggerId = "callbackTrigger";

	public void waitForMessageBox(WebDriver driver, boolean isVisible, MessageBoxType type, long timeOutSeconds) {
		driver.manage().timeouts().implicitlyWait(0, TimeUnit.SECONDS);
		WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);
		String typeDesc = type.getTypeString(type);
		final String expression = "div[id='sap-ui-static'] div[id^='__" + typeDesc + "']";
		if (isVisible) {
			wait.until(isVisible(By.cssSelector(expression)));
			// Make sure element render completely
			Sleeper.sleepTight(1000);
			return;
		}
		wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector(expression)));
		// TODO 30 need to ref a constants
		driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	public void dragDrop(WebDriver driver, IUserAction userAction, String elementId, int xOffset, int yOffset) {
		Actions actions = new Actions(driver);
		if (InitService.INSTANCE.getBrowserType() == Constants.CHROME) {
			dragDropByUserAction(driver, userAction, elementId, xOffset, yOffset);
			return;
		}
		WebElement source = driver.findElement(By.id(elementId));
		actions.dragAndDropBy(source, xOffset, yOffset).perform();
	}

	public void dragDropByUserAction(WebDriver driver, IUserAction userAction, String elementId, int xOffset,
			int yOffset) {
		Point sourcePoint = userAction.getElementLocation(driver, elementId);
		WebElement element = driver.findElement(By.id(elementId));
		Point startPoint = new Point(sourcePoint.x + element.getSize().width / 2, sourcePoint.y
				+ element.getSize().height / 2);
		Point endPoint = new Point(startPoint.x + xOffset, startPoint.y + yOffset);
		userAction.dragAndDrop(driver, startPoint, endPoint);
		userAction.mouseClickStartPoint(driver);
	}

	public ExpectedCondition<Boolean> isVisible(final By by) {
		return new ExpectedCondition<Boolean>() {

			@Override
			public Boolean apply(WebDriver input) {
				WebElement element = input.findElement(by);
				return element.getLocation().x > 0 && element.getLocation().y > 0;
			}
		};
	}

	public enum MessageBoxType {
		MBOX, ALERT, CONFIRM;

		public String getTypeString(MessageBoxType type) {
			switch (type) {
			case MBOX:
				return "mbox";
			case ALERT:
				return "alert";
			case CONFIRM:
				return "confirm";
			default:
				return "mbox";

			}
		}
	}
}
