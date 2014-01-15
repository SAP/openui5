package com.sap.ui5.selenium.util;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.NoAlertPresentException;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedCondition;

public class UI5ExpectedConditions {

	/** API: Check target Alert is existing? */
	public static boolean isAlertPresent(WebDriver driver) {

		try {
			driver.switchTo().alert();
			return true;
		} catch (NoAlertPresentException e) {
			return false;
		}
	}

	/** API: Check target element is existing? */
	public static boolean isElementPresent(WebDriver driver, By by) {

		try {
			driver.findElement(by);
			return true;
		} catch (NoSuchElementException e) {
			return false;
		}
	}

	/** API: Check target element is displayed? */
	public static boolean isElementVisible(WebElement element) {

		Point location = element.getLocation();
		Dimension size = element.getSize();

		boolean checkDisplay = (location.x > 0) && (location.y > 0) &&
				(size.getHeight() > 0) && (size.getWidth() > 0);
		return element.isDisplayed() ? true : checkDisplay;
	}

	/** API: Check target element is enabled? */
	public boolean isElementEnabled(WebElement element) {
		String ariaDisabled = element.getAttribute("aria-disabled");

		// If attribute "aria-disabled" is not set or has not value, then use selenium native method
		if ((ariaDisabled == null) || ariaDisabled.isEmpty()) {

			return element.isEnabled();

		} else {

			return !Boolean.parseBoolean(ariaDisabled);
		}
	}

	/** Wait Condition for visible element */
	public static ExpectedCondition<Boolean> visibilityOfElementLocated(
			final By by) {

		return new ExpectedCondition<Boolean>() {

			@Override
			public Boolean apply(WebDriver driver) {

				if (!isElementPresent(driver, by)) {
					return false;
				}
				return isElementVisible(driver.findElement(by));
			}
		};
	}

	/** Wait Condition for invisible element */
	public static ExpectedCondition<Boolean> invisibilityOfElementLocated(
			final By by) {

		return new ExpectedCondition<Boolean>() {

			@Override
			public Boolean apply(WebDriver driver) {

				if (!isElementPresent(driver, by)) {
					return true;
				}
				return !isElementVisible(driver.findElement(by));
			}
		};
	}

	/** Wait Condition for DOM ready*/
	public static ExpectedCondition<Boolean> domReady() {

		return new ExpectedCondition<Boolean>() {

			@Override
			public Boolean apply(WebDriver driver) {

				String jsCode = "return document.readyState;";
				String results = (String) ((JavascriptExecutor) driver).executeScript(jsCode);

				if ("complete".equals(results)) {
					return true;
				}
				return false;
			}
		};
	}

}
