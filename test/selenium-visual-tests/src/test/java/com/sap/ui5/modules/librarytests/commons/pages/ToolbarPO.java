package com.sap.ui5.modules.librarytests.commons.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.WebDriverWait;

import com.sap.ui5.selenium.common.Config;
import com.sap.ui5.selenium.common.PageBase;
import com.sap.ui5.selenium.common.TestBase;

public class ToolbarPO extends PageBase {

	@FindBy(id = "btnDlg")
	public WebElement btnDlg;

	@FindBy(id = "myDialog1-close")
	public WebElement myDialog1CloseBtn;

	@FindBy(id = "dlgTb_b_6")
	public WebElement dlgTbBtn6;

	@FindBy(id = "tb1-mn")
	public WebElement tb1Mn;

	@FindBy(id = "tb4_b_0")
	public WebElement tb4Btn1;

	public String tb1Id = "tb1";

	public String tb1TfId = "tb1_tf";

	public String tb1PuId = "tb1-pu";

	public String tb5Id = "tb5";

	public String tb5TfId = "tb5_tf";

	public String tb5CmbIconId = "tb5_cmb-icon";

	public String tb5CmbItem1Id = "tb5_cmb-lb-I1";

	public String dialogId = "myDialog1";

	public String dlgTbId = "dlgTb";

	public String dlgTbTfId = "dlgTb_tf";

	public String btn3Suffix = "_b_3";

	public String btn9Suffix = "_b_9";

	public String mnSuffix = "-mn";

	public String puSuffix = "-pu";

	public String cmbSuffix = "_cmb-lb";

	public String targetForOutputId = "targetForOutput";

	public boolean checkThemeIsGoldreflection() {
		return Config.INSTANCE.getUrlParameterTheme().contains("goldreflection");
	}

	public void resizeWindow(WebDriver driver, Point startPoint, Dimension dimension) {
		driver.manage().window().setPosition(startPoint);
		driver.manage().window().setSize(dimension);
	}

	public void resizeWindow(WebDriver driver, int startX, int startY, int width, int height) {
		Point startPoint = new Point(startX, startY);
		Dimension dimension = new Dimension(width, height);
		resizeWindow(driver, startPoint, dimension);
	}

	public void openOverflowToolBar(WebDriver driver, String toolbarId, long timeOutSeconds, TestBase base) {
		driver.findElement(By.id(toolbarId + mnSuffix)).click();
		base.waitForElement(driver, true, toolbarId + puSuffix, timeOutSeconds);
	}

	public void checkToolBarOverflowIcons(WebDriver driver, long timeOutSeconds) {
		WebDriverWait wait = new WebDriverWait(driver, timeOutSeconds);
		for (int i = 1; i <= 8; i++) {
			final By by = By.id("tb" + i + mnSuffix);
			wait.until(new ExpectedCondition<Boolean>() {
				@Override
				public Boolean apply(WebDriver driver) {
					WebElement element = driver.findElement(by);
					return element.getLocation().x > 0 && element.getLocation().y > 0;
				}
			});
		}
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
}
