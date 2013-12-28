package com.sap.ui5.modules.librarytests.commons.pages;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
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
import com.sap.ui5.selenium.common.TestBase;

public class RoadMapPO {

	@FindBy(id = "roadMap1")
	public WebElement roadMap1;

	@FindBy(id = "roadMap2-Start")
	public WebElement startElement;

	@FindBy(id = "roadMap2-End")
	public WebElement endElement;

	@FindBy(id = "roadMap2_s1-label")
	public WebElement step1LabelElement;

	@FindBy(id = "roadMap2_s2-box")
	public WebElement step2BoxElement;

	@FindBy(id = "roadMap2_s2-label")
	public WebElement step2LabelElement;

	@FindBy(id = "roadMap2_s4_sub2")
	public WebElement step4Sub2Element;

	@FindBy(id = "roadMap2_s4")
	public WebElement step4Element;

	@FindBy(id = "roadMap2_s4_sub4-box")
	public WebElement step4Sub4BoxElement;

	@FindBy(id = "roadMap2_s4_sub4-label")
	public WebElement step4Sub4LabelElement;

	@FindBy(id = "roadMap2_s4-expandend")
	public WebElement step4ExpandendElement;

	public String roadMap1Id = "roadMap1";

	public String roadMap2Id = "roadMap2";

	public String roadMap2Step1Id = "roadMap2_s1";

	public String roadMap2Step2Id = "roadMap2_s2";

	public String step4Sub1Id = "roadMap2_s4_sub1";

	public String step4Sub4Id = "roadMap2_s4_sub4";

	public String roadMapEndId = "roadMap2-End";

	public String roadMapStartId = "roadMap2-Start";

	public String roadMap2Step4ExpandendId = "roadMap2_s4-expandend";

	public String selectedStepId = "selectedStep";

	public String startScrollClassName = "sapUiRoadMapStartScroll";

	public String endScrollClassName = "sapUiRoadMapEndScroll";

	public List<WebElement> getSubStepBoxElements(WebDriver driver, String roadMapId) {
		return driver.findElements(By.cssSelector("div[id^='" + roadMapId + "_s'][id$='-box']"));
	}

	public boolean isVisible(WebElement element) {
		// element.isDisplayed() cannot work for FF
		return !element.getCssValue("display").equals("none");
	}

	public WebElement findBoxParentElement(WebElement boxElement) {
		return boxElement.findElement(By.xpath("./.."));
	}

	public WebElement getLastSubElement(WebDriver driver, String roadMapId) {
		List<WebElement> subElements = driver.findElement(By.id(roadMapId)).findElements(By.xpath("./ul/li"));
		int lastIndex = subElements.size() - 1;
		return subElements.get(lastIndex);
	}

	public void waitForElementClickable(WebDriver driver, String elementId, long timeOutSeconds) {
		WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);
		wait.until(ExpectedConditions.elementToBeClickable(By.id(elementId)));
	}

	public void waitForNonExistClassName(WebDriver driver, String elementId, long timeOutSeconds, String className) {
		WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);
		wait.until(nonExistClassName(By.id(elementId), className));
	}

	public ExpectedCondition<Boolean> nonExistClassName(final By locator, final String className) {
		return new ExpectedCondition<Boolean>() {
			@Override
			public Boolean apply(WebDriver driver) {
				return !driver.findElement(locator).getAttribute("class").contains(className);
			}
		};
	}

	/**
	 * Move to element, using left or right
	 *
	 * @param actions
	 * @param isRtl
	 * @param steps	move how much steps
	 */

	public void moveToElementByKeyboard(Actions actions, boolean isRtl, int steps) {
		Keys[] keys = new Keys[steps];
		if (isRtl) {
			for (int i = 0; i < steps; i++) {
				keys[i] = Keys.LEFT;
			}
		} else {
			for (int i = 0; i < steps; i++) {
				keys[i] = Keys.RIGHT;
			}
		}
		actions.sendKeys(keys).perform();
	}

	public void showTooltip(WebDriver driver, IUserAction userAction, String elementId, TestBase base, int waitMilliseconds) {
		if (base.browserIsFirefox()) {
			moveToElementStartPoint(driver, userAction, elementId);
			Sleeper.sleepTight(waitMilliseconds);
			userAction.mouseMoveToStartPoint(driver);
		}
		moveToElementStartPoint(driver, userAction, elementId);
		Sleeper.sleepTight(waitMilliseconds);
	}

	/**
	 * Move mouse to start point of element
	 *
	 * @param driver
	 * @param userAction
	 * @param elementId
	 */
	public void moveToElementStartPoint(WebDriver driver, IUserAction userAction, String elementId) {
		Point location = userAction.getElementLocation(driver, elementId);
		Point targetLocation = new Point(location.x + 1, location.y + 1);
		userAction.mouseMove(targetLocation);
	}

}
