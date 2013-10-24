package com.sap.ui5.modules.librarytests.commons.tests;

import java.awt.event.KeyEvent;

import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.PageFactory;

import com.sap.ui5.modules.librarytests.commons.pages.DatePickerPO;
import com.sap.ui5.selenium.common.TestBase;
import com.sap.ui5.selenium.util.Constants;

public class DatePickerTest extends TestBase {

	private DatePickerPO page;

	private String targetUrl = "/uilib-sample/test-resources/sap/ui/commons/visual/DatePicker.html";

	private int waitMilliseconds = 1000;

	private int timeOutSeconds = 10;

	@Before
	public void setUp() {
		page = PageFactory.initElements(driver, DatePickerPO.class);
		driver.get(getFullUrl(targetUrl));
		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testAllElements() {
		verifyFullPageUI("full-initial");
	}

	@Test
	public void testMouseActions() {
		Actions actions = new Actions(driver);
		// Avoid generating no dashed on FIREFOX
		actions.sendKeys(Keys.TAB, Keys.TAB).perform();

		// Check Mouse actions on DatePicker_default
		String datePickerId = page.defaultDatePickerId;

		// Check MouseOver on calendar icon
		userAction.mouseOver(driver, page.defaultDatePickerIconId, waitMilliseconds);
		verifyElementUI(datePickerId, datePickerId + "-MouseOver");
		userAction.mouseMoveToStartPoint(driver);

		// Check Click on calendar icon
		page.openDefaultDatePickerByUserAction(driver, userAction, timeOutSeconds, this);
		verifyCalendar("-CalendarOpened");

		// actions.click(page.prevMonthBtn).perform();
		page.clickNoIdElement(driver, userAction, page.prevMonthBtn);
		waitForReady(waitMilliseconds * 5);
		verifyCalendar("-Navigate-PreviousMonth");
		page.clickNoIdElement(driver, userAction, page.nextMonthBtn);
		waitForReady(waitMilliseconds);
		// actions.click(page.nextMonthBtn).perform();
		verifyCalendar("-Navigate-NextMonth");

		// Select last month from the 'month' dropDown list
		page.clickLastMonth();
		verifyCalendar("-Select-LastMonth");

		// Select first year from the 'year' dropDown list
		page.clickFirstYear();
		verifyCalendar("-Select-FirstYear");

		// Close and reopen calendar - Check mouseOver on a specific day (June 30)
		actions.sendKeys(Keys.ESCAPE).perform();
		waitForElement(driver, false, page.calendarDivId, timeOutSeconds);
		page.openDefaultDatePickerByUserAction(driver, userAction, timeOutSeconds, this);
		WebElement thirtiethDayElement = page.getDayInCurrentMonth(driver, 30);
		page.mouseOver(driver, userAction, thirtiethDayElement);
		verifyElementUI(page.datePickerId, "default-MouseOverDay");
		userAction.mouseMoveToStartPoint(driver);

		// Check selection of a specific day (June 1)
		WebElement firstDayElement = page.getDayInCurrentMonth(driver, 1);
		page.clickNoIdElement(driver, userAction, firstDayElement);
		actions.sendKeys(page.defalutDatePickerInput, Keys.chord(Keys.CONTROL, "a")).perform();
		String[] locale = datePickerId.split("_");
		verifyElementUI(page.targetArea1Id, locale[1] + "-SelectDay");
		verifyElementUI(page.currentDateId, locale[1] + "-Mouse-Event-SelectDay");

		// Check, whether date is converted correctly, when entered in format 'yyyyMMdd'
		actions.sendKeys(Keys.chord(Keys.CONTROL, "a"), "19770309").perform();
		page.openDefaultDatePickerByUserAction(driver, userAction, timeOutSeconds, this);
		verifyCalendar("-CalculatedDate");
		verifyElementUI(page.currentDateId, locale[1] + "-Mouse-CalculatedDate");

		userAction.mouseClickStartPoint(driver);
	}

	@Test
	public void testKeyboardActions() {
		Actions actions = new Actions(driver);
		// Check Keyboard actions on DatePicker_default
		String datePickerId = page.defaultDatePickerId;

		// Check calendar Focus
		actions.sendKeys(Keys.TAB).perform();
		verifyElementUI(datePickerId, datePickerId + "-KB-Focus");

		// --------- Check keyboard navigation within one month -------------
		checkKeyboardWithinOneMonth(actions);

		// --------- Check keyboard navigation within one year-------------
		checkKeyboardWithinOneYear(actions);

		// Check, whether a disabled datePicker is not focused in the tab chain
		userAction.mouseClickStartPoint(driver);
		actions.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform();
		verifyFullPageUI("DisabledDatePickerNotFocused");
	}

	@Test
	public void testCaldendarFormater() {
		page.openCalendar(driver, userAction, page.defaultDatePickerId, timeOutSeconds, this);
		verifyFullPageUI(page.defaultDatePickerId + "-Week-Starting-With-Sunday");

		page.openCalendar(driver, userAction, page.germanDatePickerId, timeOutSeconds, this);
		verifyFullPageUI(page.germanDatePickerId + "-Week-Starting-With-Monday");
	}

	private void checkKeyboardWithinOneMonth(Actions actions) {
		// Check opening calendar with F4-key
		actions.sendKeys(Keys.F4).perform();
		waitForElement(driver, true, page.calendarDivId, timeOutSeconds);
		verifyCalendar("-KB-CalendarOpened-F4");

		// Check navigation to the next day
		page.nextDay(actions, isRtlTrue());
		verifyCalendar("-KB-Navigate-NextDay");

		// Check navigation to the next week
		actions.sendKeys(Keys.DOWN).perform();
		verifyCalendar("-KB-Navigate-NextWeek");
		// Check navigation to the beginning of the current week
		actions.sendKeys(Keys.HOME).perform();
		verifyCalendar("-KB-Navigate-WeekStart");

		actions.sendKeys(Keys.END).perform();
		verifyCalendar("-KB-Navigate-WeekEnd");

		// Check navigation to the beginning of the current month
		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_HOME);

		userAction.pressTwoKeys(KeyEvent.VK_CONTROL, KeyEvent.VK_END);
		verifyCalendar("-KB-Navigate-MonthEND");

		// Check navigation to the previous day
		page.previousDay(actions, isRtlTrue());
		verifyCalendar("-KB-Navigate-PreviousDay");

		// Check navigation to the previous week
		actions.sendKeys(Keys.UP).perform();
		verifyCalendar("-KB-Navigate-PreviousWeek");

		// Check, if calendar closes when Escape key was pressed
		actions.sendKeys(Keys.ESCAPE).perform();
		waitForElement(driver, false, page.calendarDivId, timeOutSeconds);
		actions.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		String[] locale = page.defaultDatePickerId.split("_");
		verifyElementUI(page.targetArea1Id, locale[1] + "-KB-CalendarClosed-ESC");
	}

	private void checkKeyboardWithinOneYear(Actions actions) {
		// Check opening calendar with F4 key,
		actions.sendKeys(Keys.F4).perform();
		waitForElement(driver, true, page.calendarDivId, timeOutSeconds);

		// Check navigation to the previous month
		actions.sendKeys(Keys.PAGE_UP).perform();
		verifyCalendar("-KB-Navigate-PreviousMonth");

		// Check month selection from dropDown box
		actions.sendKeys(Keys.TAB).perform();
		if (getBrowserType() == Constants.CHROME) {
			actions.sendKeys(Keys.UP).perform();
		} else {
			userAction.pressTwoKeys(KeyEvent.VK_ALT, KeyEvent.VK_DOWN);
			userAction.pressOneKey(KeyEvent.VK_UP);
			userAction.pressOneKey(KeyEvent.VK_ENTER);
		}
		verifyCalendar("-KB-SelectMonth");

		// Check date selection with ENTER key
		// actions.sendKeys(Keys.chord(Keys.SHIFT, Keys.TAB)).perform() cannot make sure focus on the element;
		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_TAB);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		waitForElement(driver, false, page.calendarDivId, timeOutSeconds);
		verifyElements(actions, Keys.ENTER.name());

		// Check navigation to the next month
		actions.sendKeys(Keys.F4, Keys.PAGE_DOWN).perform();
		waitForReady(waitMilliseconds);
		verifyCalendar("-KB-Navigate-NextMonth");

		// Check year selection
		userAction.pressTwoKeys(KeyEvent.VK_SHIFT, KeyEvent.VK_TAB);
		actions.sendKeys(Keys.END).perform();
		verifyCalendar("-KB-SelectYear");

		// Check date selection with SPACE key
		// actions.sendKeys(Keys.TAB).perform() cannot make sure focus on the element;
		userAction.pressOneKey(KeyEvent.VK_TAB);
		actions.sendKeys(Keys.SPACE).perform();
		waitForElement(driver, false, page.calendarDivId, timeOutSeconds);
		verifyElements(actions, Keys.SPACE.name());

		// Check, whether date is converted correctly, when entered in format 'yyyymmdd'
		actions.sendKeys(Keys.chord(Keys.CONTROL, "a"), "19770309").perform();
		waitForReady(waitMilliseconds);
		userAction.pressOneKey(KeyEvent.VK_ENTER);
		String[] locale = page.defaultDatePickerId.split("_");
		verifyElementUI(page.currentDateId, page.currentDateId + "-" + locale[1] + "-KB-CalculatedDate");

		actions.sendKeys(Keys.F4).perform();
		waitForElement(driver, true, page.calendarDivId, timeOutSeconds);
		verifyCalendar("-KB-CalculatedDate");

		actions.sendKeys(Keys.ESCAPE).perform();
		waitForElement(driver, false, page.calendarDivId, timeOutSeconds);

		// Check Date change using keyboard without calendar opened
		actions.sendKeys(Keys.PAGE_UP, Keys.chord(Keys.CONTROL, "a")).perform();
		verifyElementUI(page.defaultDatePickerId, page.defaultDatePickerId + "-KB-INC-DAY");

		// Check Date change using keyboard without calendar opened
		actions.sendKeys(Keys.PAGE_DOWN, Keys.chord(Keys.CONTROL, "a")).perform();
		verifyElementUI(page.defaultDatePickerId, page.defaultDatePickerId + "-KB-DEC-DAY");
	}

	private void verifyCalendar(String desc) {
		String[] locale = page.defaultDatePickerId.split("_");
		String expectedImageName = locale[1] + desc;

		// Increase image stability on IE9
		if (getBrowserType() == Constants.IE9 || getBrowserType() == Constants.IE10) {
			verifyFullPageUI(expectedImageName);
		} else {
			verifyElementUI(page.targetArea1Id, expectedImageName);
		}
	}

	private void verifyElements(Actions actions, String keyName) {
		if (getBrowserType() != Constants.IE8) {
			actions.sendKeys(Keys.chord(Keys.CONTROL, "a")).perform();
		}
		String[] locale = page.defaultDatePickerId.split("_");
		verifyElementUI(page.targetArea1Id, locale[1] + "-KB-SelectDay-" + keyName);
		verifyElementUI(page.currentDateId, locale[1] + "-KB-Event-SelectDay-" + keyName);
	}

}
