package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;

import com.sap.ui5.selenium.action.IUserAction;
import com.sap.ui5.selenium.action.UserActionIE8;
import com.sap.ui5.selenium.common.CommonBase;
import com.sap.ui5.selenium.common.Config;
import com.sap.ui5.selenium.common.InitService;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.util.Constants;

public class DatePickerPO extends PageBase {

	@FindBy(css = "div[data-sap-ui^=DatePicker]")
	public List<WebElement> datePickers;

	@FindBy(className = "ui-datepicker-next")
	public WebElement nextMonthBtn;

	@FindBy(className = "ui-datepicker-prev")
	public WebElement prevMonthBtn;

	@FindBy(className = "ui-datepicker-month")
	public WebElement monthSelection;

	@FindBy(className = "ui-datepicker-year")
	public WebElement yearSelection;

	@FindBy(id = "DatePicker_default-icon")
	public WebElement defaultDatePickerIcon;

	@FindBy(id = "DatePicker_de-icon")
	public WebElement germanDatePickerIcon;

	@FindBy(id = "DatePicker_default-input")
	public WebElement defalutDatePickerInput;

	public String defaultDatePickerId = "DatePicker_default";

	public String defaultDatePickerIconId = "DatePicker_default-icon";

	public String germanDatePickerId = "DatePicker_de";

	public String calendarDivId = "ui-datepicker-div";

	public String currentDateId = "currentDate";

	public String targetArea1Id = "target1b";

	public String targetArea4Id = "target4b";

	public String datePickerId = "ui-datepicker-div";

	public boolean checkCalenderByDatePickerId(WebDriver driver, String datePickerId) {
		WebElement calendarElement = driver.findElement(By.id(calendarDivId));
		if (datePickerId.equals(calendarElement.getAttribute("associatedControlId"))) {
			return true;
		}
		throw new WebDriverException("Not find the id [" + calendarDivId + "], associatedControlId [" + datePickerId
				+ "]");
	}

	public void clickLastMonth() {
		List<WebElement> monthOptions = monthSelection.findElements(By.tagName("option"));
		monthOptions.get(monthOptions.size() - 1).click();
	}

	public void clickFirstYear() {
		List<WebElement> monthOptions = yearSelection.findElements(By.tagName("option"));
		monthOptions.get(0).click();
	}

	public List<WebElement> getOneDayElements(WebDriver driver, int day) {
		return driver.findElement(By.id(calendarDivId)).findElements(By.linkText(day + ""));
	}

	public WebElement getDayInCurrentMonth(WebDriver driver, int day) {
		List<WebElement> elements = getOneDayElements(driver, day);
		for (WebElement element : elements) {
			if (!element.getAttribute("class").contains("ui-priority-secondary")) {
				return element;
			}
		}
		return elements.get(0);
	}

	public void openDefaultDatePickerByUserAction(WebDriver driver, IUserAction userAction, long timeOutSeconds,
			CommonBase base) {
		userAction.mouseClick(driver, defaultDatePickerIconId);
		userAction.mouseMoveToStartPoint(driver);
		base.waitForElement(driver, true, calendarDivId, timeOutSeconds);
	}

	public void nextDay(Actions actions, boolean isRtl) {
		if (isRtl) {
			actions.sendKeys(Keys.LEFT).perform();
		} else {
			actions.sendKeys(Keys.RIGHT).perform();
		}
	}

	public void previousDay(Actions actions, boolean isRtl) {
		if (isRtl) {
			actions.sendKeys(Keys.RIGHT).perform();
		} else {
			actions.sendKeys(Keys.LEFT).perform();
		}
	}

	public boolean themeIsContainsHCB() {
		return Config.INSTANCE.getUrlParameterTheme().contains("hcb");
	}

	public void openCalendar(WebDriver driver, IUserAction userAction, String datePickerId, long timeOutSeconds,
			CommonBase base) {
		userAction.mouseClick(driver, datePickerId + "-icon");
		if ("DatePicker_disabled".equals(datePickerId) || "DatePicker_readonly".equals(datePickerId)) {
			return;
		}
		base.waitForElement(driver, true, calendarDivId, timeOutSeconds);
		userAction.mouseMoveToStartPoint(driver);
	}

	public String getTargetAreaId(int index) {
		return "target" + index + "b";
	}

	public void clickNoIdElement1(WebDriver driver, IUserAction userAction, WebElement element) {
		Point point = getLocaction(driver, userAction, element);
		userAction.mouseClick(point);
		userAction.mouseMoveToStartPoint(driver);
	}

	public void clickNoIdElement(WebDriver driver, IUserAction userAction, WebElement element) {
		Point location = getLocaction(driver, userAction, element);
		if (InitService.INSTANCE.getBrowserType() == Constants.IE8 && userAction.getRtl()) {
			int scrollBarWidth = new UserActionIE8().getScollBarWidth(driver);

			new Actions(driver)
					.moveToElement(element, element.getSize().width / 2 + scrollBarWidth, element.getSize().height / 2)
					.click().perform();
		} else if (InitService.INSTANCE.getBrowserType() == Constants.IE8 && !userAction.getRtl()) {
			new Actions(driver).moveToElement(element).click().perform();
		} else {
			// Avoid twinkle of icon on IE9
			userAction.mouseClick(location);
		}
		userAction.mouseMoveToStartPoint(driver);
	}

	public Point getLocaction(WebDriver driver, IUserAction userAction, WebElement element) {
		Point sourcePoint = element.getLocation();
		Point startPoint = userAction.getBrowserViewBoxLocation(driver);
		Point targetPoint = new Point(sourcePoint.x + startPoint.x, sourcePoint.y + startPoint.y);
		Dimension dimension = element.getSize();
		Point targetCenterPoint = new Point(targetPoint.x + dimension.width / 2, targetPoint.y + dimension.height / 2);
		if (InitService.INSTANCE.getBrowserType() == Constants.IE8 && userAction.getRtl()) {
			int scrollBarWidth = new UserActionIE8().getScollBarWidth(driver);
			targetCenterPoint = new Point(targetCenterPoint.x + scrollBarWidth, targetCenterPoint.y);
		}
		return targetCenterPoint;
	}

	public void mouseOver(WebDriver driver, IUserAction userAction, WebElement element) {
		if (InitService.INSTANCE.getBrowserType() == Constants.IE8 && userAction.getRtl()) {
			// Fix position error when the scroll bar at the left of IE
			int scrollBarWidth = new UserActionIE8().getScollBarWidth(driver);
			new Actions(driver).moveToElement(element, element.getSize().width / 2 + scrollBarWidth,
					element.getSize().height / 2).perform();
		} else if (InitService.INSTANCE.getBrowserType() == Constants.IE8 && !userAction.getRtl()) {
			// Fix not work for IE when move over by userAction
			new Actions(driver).moveToElement(element).perform();
		}
		Point p = getLocaction(driver, userAction, element);
		userAction.mouseMove(p);
	}
}
